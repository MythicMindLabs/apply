#![cfg_attr(not(feature = "std"), no_std, no_main)]

/// EchoPay-2 Payment Recorder Smart Contract
/// 
/// This contract records payment transactions initiated through voice commands,
/// providing on-chain history and audit trails for the EchoPay-2 dApp.
/// 
/// Features:
/// - Records payment details with voice command metadata
/// - Provides payment history queries
/// - Implements security measures and access controls
/// - Emits events for off-chain monitoring

#[ink::contract]
mod payment_recorder {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;
    use ink::prelude::string::String;

    /// Represents a recorded payment transaction
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(Debug, PartialEq, Eq))]
    pub struct PaymentRecord {
        /// The recipient's account ID
        pub recipient: AccountId,
        /// The payment amount in smallest unit (Planck for DOT)
        pub amount: Balance,
        /// The original voice command that initiated this payment
        pub voice_command: String,
        /// Currency type (DOT, WND, etc.)
        pub currency: String,
        /// Network where payment was made
        pub network: String,
        /// Timestamp when the payment was recorded
        pub timestamp: Timestamp,
        /// Voice recognition confidence score (0-100)
        pub confidence: u8,
    }

    /// The main contract storage
    #[ink(storage)]
    pub struct PaymentRecorder {
        /// Maps user AccountId to their payment history
        payment_history: Mapping<AccountId, Vec<PaymentRecord>>,
        /// Contract owner for administrative functions
        owner: AccountId,
        /// Total number of payments recorded
        total_payments: u64,
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct PaymentRecorded {
        #[ink(topic)]
        sender: AccountId,
        #[ink(topic)]
        recipient: AccountId,
        amount: Balance,
        voice_command: String,
        timestamp: Timestamp,
    }

    /// Contract errors
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        /// Unauthorized access attempt
        Unauthorized,
        /// Invalid payment amount (zero or negative)
        InvalidAmount,
        /// Voice command string is empty or too long
        InvalidVoiceCommand,
        /// Currency string is invalid
        InvalidCurrency,
        /// Confidence score is out of valid range
        InvalidConfidence,
    }

    /// Contract result type
    pub type Result<T> = core::result::Result<T, Error>;

    impl PaymentRecorder {
        /// Creates a new PaymentRecorder contract instance
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                payment_history: Mapping::new(),
                owner: Self::env().caller(),
                total_payments: 0,
            }
        }

        /// Records a new payment transaction
        /// 
        /// # Arguments
        /// * `recipient` - The recipient's AccountId
        /// * `amount` - The payment amount in smallest unit
        /// * `voice_command` - The original voice command
        /// * `currency` - Currency type (e.g., "DOT", "WND")
        /// * `network` - Network name (e.g., "polkadot", "rococo")
        /// * `confidence` - Voice recognition confidence (0-100)
        /// 
        /// # Returns
        /// * `Result<()>` - Success or error
        #[ink(message)]
        pub fn record_payment(
            &mut self,
            recipient: AccountId,
            amount: Balance,
            voice_command: String,
            currency: String,
            network: String,
            confidence: u8,
        ) -> Result<()> {
            // Validate inputs
            if amount == 0 {
                return Err(Error::InvalidAmount);
            }

            if voice_command.is_empty() || voice_command.len() > 200 {
                return Err(Error::InvalidVoiceCommand);
            }

            if currency.is_empty() || currency.len() > 10 {
                return Err(Error::InvalidCurrency);
            }

            if confidence > 100 {
                return Err(Error::InvalidConfidence);
            }

            let sender = self.env().caller();
            let timestamp = self.env().block_timestamp();

            // Create payment record
            let record = PaymentRecord {
                recipient,
                amount,
                voice_command: voice_command.clone(),
                currency,
                network,
                timestamp,
                confidence,
            };

            // Get or create payment history for sender
            let mut history = self.payment_history.get(&sender).unwrap_or_default();
            history.push(record);
            
            // Update storage
            self.payment_history.insert(&sender, &history);
            self.total_payments += 1;

            // Emit event
            self.env().emit_event(PaymentRecorded {
                sender,
                recipient,
                amount,
                voice_command,
                timestamp,
            });

            Ok(())
        }

        /// Retrieves payment history for a specific user
        /// 
        /// # Arguments
        /// * `user` - The user's AccountId
        /// 
        /// # Returns
        /// * `Vec<PaymentRecord>` - List of payment records
        #[ink(message)]
        pub fn get_payment_history(&self, user: AccountId) -> Vec<PaymentRecord> {
            self.payment_history.get(&user).unwrap_or_default()
        }

        /// Retrieves the caller's own payment history
        /// 
        /// # Returns
        /// * `Vec<PaymentRecord>` - List of payment records for the caller
        #[ink(message)]
        pub fn get_my_payment_history(&self) -> Vec<PaymentRecord> {
            let caller = self.env().caller();
            self.get_payment_history(caller)
        }

        /// Gets the total number of payments recorded
        /// 
        /// # Returns
        /// * `u64` - Total number of payments
        #[ink(message)]
        pub fn get_total_payments(&self) -> u64 {
            self.total_payments
        }

        /// Gets the contract owner
        /// 
        /// # Returns
        /// * `AccountId` - The owner's account ID
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        /// Transfers ownership of the contract (owner only)
        /// 
        /// # Arguments
        /// * `new_owner` - The new owner's AccountId
        /// 
        /// # Returns
        /// * `Result<()>` - Success or error
        #[ink(message)]
        pub fn transfer_ownership(&mut self, new_owner: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::Unauthorized);
            }
            
            self.owner = new_owner;
            Ok(())
        }

        /// Gets payment statistics for a user
        /// 
        /// # Arguments
        /// * `user` - The user's AccountId
        /// 
        /// # Returns
        /// * `(u32, Balance)` - (number of payments, total amount sent)
        #[ink(message)]
        pub fn get_user_stats(&self, user: AccountId) -> (u32, Balance) {
            let history = self.payment_history.get(&user).unwrap_or_default();
            let count = history.len() as u32;
            let total_amount = history.iter().map(|record| record.amount).sum();
            (count, total_amount)
        }

        /// Gets recent payments (last N payments for a user)
        /// 
        /// # Arguments
        /// * `user` - The user's AccountId  
        /// * `limit` - Maximum number of recent payments to return
        /// 
        /// # Returns
        /// * `Vec<PaymentRecord>` - Recent payment records
        #[ink(message)]
        pub fn get_recent_payments(&self, user: AccountId, limit: u32) -> Vec<PaymentRecord> {
            let history = self.payment_history.get(&user).unwrap_or_default();
            let start_index = if history.len() > limit as usize {
                history.len() - limit as usize
            } else {
                0
            };
            
            history[start_index..].to_vec()
        }
    }

    /// Unit tests for the contract
    #[cfg(test)]
    mod tests {
        use super::*;

        /// Helper function to create a test payment record
        fn create_test_record() -> (AccountId, Balance, String, String, String, u8) {
            let recipient = AccountId::from([0x01; 32]);
            let amount = 1000000000000; // 1 DOT in Planck
            let voice_command = String::from("Send 1 DOT to Alice");
            let currency = String::from("DOT");
            let network = String::from("polkadot");
            let confidence = 95;
            
            (recipient, amount, voice_command, currency, network, confidence)
        }

        #[ink::test]
        fn test_new_contract() {
            let contract = PaymentRecorder::new();
            assert_eq!(contract.get_total_payments(), 0);
        }

        #[ink::test]
        fn test_record_payment_success() {
            let mut contract = PaymentRecorder::new();
            let (recipient, amount, voice_command, currency, network, confidence) = create_test_record();
            
            let result = contract.record_payment(
                recipient,
                amount,
                voice_command.clone(),
                currency,
                network,
                confidence,
            );
            
            assert!(result.is_ok());
            assert_eq!(contract.get_total_payments(), 1);
            
            let history = contract.get_my_payment_history();
            assert_eq!(history.len(), 1);
            assert_eq!(history[0].recipient, recipient);
            assert_eq!(history[0].amount, amount);
            assert_eq!(history[0].voice_command, voice_command);
        }

        #[ink::test]
        fn test_record_payment_invalid_amount() {
            let mut contract = PaymentRecorder::new();
            let (recipient, _, voice_command, currency, network, confidence) = create_test_record();
            
            let result = contract.record_payment(
                recipient,
                0, // Invalid amount
                voice_command,
                currency,
                network,
                confidence,
            );
            
            assert_eq!(result, Err(Error::InvalidAmount));
        }

        #[ink::test]
        fn test_record_payment_invalid_voice_command() {
            let mut contract = PaymentRecorder::new();
            let (recipient, amount, _, currency, network, confidence) = create_test_record();
            
            let result = contract.record_payment(
                recipient,
                amount,
                String::new(), // Empty voice command
                currency,
                network,
                confidence,
            );
            
            assert_eq!(result, Err(Error::InvalidVoiceCommand));
        }

        #[ink::test]
        fn test_record_payment_invalid_confidence() {
            let mut contract = PaymentRecorder::new();
            let (recipient, amount, voice_command, currency, network, _) = create_test_record();
            
            let result = contract.record_payment(
                recipient,
                amount,
                voice_command,
                currency,
                network,
                101, // Invalid confidence > 100
            );
            
            assert_eq!(result, Err(Error::InvalidConfidence));
        }

        #[ink::test]
        fn test_user_stats() {
            let mut contract = PaymentRecorder::new();
            let (recipient, amount, voice_command, currency, network, confidence) = create_test_record();
            
            // Record multiple payments
            for i in 0..3 {
                let mut cmd = voice_command.clone();
                cmd.push_str(&i.to_string());
                contract.record_payment(
                    recipient,
                    amount,
                    cmd,
                    currency.clone(),
                    network.clone(),
                    confidence,
                ).unwrap();
            }
            
            let caller = contract.env().caller();
            let (count, total_amount) = contract.get_user_stats(caller);
            
            assert_eq!(count, 3);
            assert_eq!(total_amount, amount * 3);
        }

        #[ink::test]
        fn test_recent_payments() {
            let mut contract = PaymentRecorder::new();
            let (recipient, amount, voice_command, currency, network, confidence) = create_test_record();
            
            // Record 5 payments
            for i in 0..5 {
                let mut cmd = voice_command.clone();
                cmd.push_str(&i.to_string());
                contract.record_payment(
                    recipient,
                    amount + i as u128,
                    cmd,
                    currency.clone(),
                    network.clone(),
                    confidence,
                ).unwrap();
            }
            
            let caller = contract.env().caller();
            let recent = contract.get_recent_payments(caller, 3);
            
            assert_eq!(recent.len(), 3);
            // Should return the last 3 payments
            assert_eq!(recent[0].amount, amount + 2);
            assert_eq!(recent[1].amount, amount + 3);
            assert_eq!(recent[2].amount, amount + 4);
        }

        #[ink::test]
        fn test_transfer_ownership() {
            let mut contract = PaymentRecorder::new();
            let new_owner = AccountId::from([0x02; 32]);
            
            let result = contract.transfer_ownership(new_owner);
            assert!(result.is_ok());
            assert_eq!(contract.get_owner(), new_owner);
        }
    }
}
