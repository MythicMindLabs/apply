#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod payment_recorder {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    /// Represents a payment record
    #[ink::storage_item]
    #[derive(Debug, Clone, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct PaymentRecord {
        /// Recipient of the payment
        pub recipient: AccountId,
        /// Amount of payment in planck (smallest DOT unit)
        pub amount: Balance,
        /// Block timestamp when payment was recorded
        pub timestamp: Timestamp,
        /// Optional memo for the payment
        pub memo: Option<Vec<u8>>,
    }

    /// The payment recorder contract storage
    #[ink(storage)]
    pub struct PaymentRecorder {
        /// Mapping from sender AccountId to their payment history
        payment_history: Mapping<AccountId, Vec<PaymentRecord>>,
        /// Total number of payments recorded
        total_payments: u64,
        /// Contract owner
        owner: AccountId,
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct PaymentRecorded {
        /// Sender of the payment
        #[ink(topic)]
        sender: AccountId,
        /// Recipient of the payment
        #[ink(topic)]
        recipient: AccountId,
        /// Amount of the payment
        amount: Balance,
        /// Block timestamp
        timestamp: Timestamp,
        /// Payment memo
        memo: Option<Vec<u8>>,
    }

    /// Errors that can occur during contract execution
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        /// Caller is not authorized to perform this action
        Unauthorized,
        /// Payment amount cannot be zero
        ZeroAmount,
        /// Invalid recipient address
        InvalidRecipient,
    }

    /// Contract result type
    pub type Result<T> = core::result::Result<T, Error>;

    impl PaymentRecorder {
        /// Creates a new payment recorder contract
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            Self {
                payment_history: Mapping::default(),
                total_payments: 0,
                owner: caller,
            }
        }

        /// Records a payment transaction
        #[ink(message)]
        pub fn record_payment(
            &mut self,
            recipient: AccountId,
            amount: Balance,
            memo: Option<Vec<u8>>,
        ) -> Result<()> {
            // Validate inputs
            if amount == 0 {
                return Err(Error::ZeroAmount);
            }

            let caller = self.env().caller();
            let timestamp = self.env().block_timestamp();

            // Create payment record
            let payment_record = PaymentRecord {
                recipient,
                amount,
                timestamp,
                memo: memo.clone(),
            };

            // Get existing payment history or create new vector
            let mut history = self.payment_history.get(&caller).unwrap_or_default();
            history.push(payment_record);

            // Update storage
            self.payment_history.insert(&caller, &history);
            self.total_payments += 1;

            // Emit event
            self.env().emit_event(PaymentRecorded {
                sender: caller,
                recipient,
                amount,
                timestamp,
                memo,
            });

            Ok(())
        }

        /// Retrieves payment history for a specific user
        #[ink(message)]
        pub fn get_payment_history(&self, user: AccountId) -> Vec<PaymentRecord> {
            self.payment_history.get(&user).unwrap_or_default()
        }

        /// Retrieves payment history for the caller
        #[ink(message)]
        pub fn get_my_payment_history(&self) -> Vec<PaymentRecord> {
            let caller = self.env().caller();
            self.get_payment_history(caller)
        }

        /// Gets the total number of payments recorded
        #[ink(message)]
        pub fn get_total_payments(&self) -> u64 {
            self.total_payments
        }

        /// Gets the contract owner
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        /// Checks if an account has any payment history
        #[ink(message)]
        pub fn has_payment_history(&self, user: AccountId) -> bool {
            self.payment_history.contains(&user)
        }

        /// Gets the number of payments for a specific user
        #[ink(message)]
        pub fn get_payment_count(&self, user: AccountId) -> u32 {
            self.payment_history.get(&user)
                .map(|history| history.len() as u32)
                .unwrap_or(0)
        }

        /// Emergency function to clear all data (only owner)
        #[ink(message)]
        pub fn emergency_clear(&mut self) -> Result<()> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::Unauthorized);
            }

            // This is a simplified clear - in practice, you'd need to iterate
            // through all keys to properly clear the mapping
            self.total_payments = 0;

            Ok(())
        }
    }

    /// Unit tests for the contract
    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn new_works() {
            let contract = PaymentRecorder::new();
            assert_eq!(contract.get_total_payments(), 0);
        }

        #[ink::test]
        fn record_payment_works() {
            let mut contract = PaymentRecorder::new();
            let recipient = AccountId::from([0x01; 32]);
            let amount = 1000;

            let result = contract.record_payment(recipient, amount, None);
            assert_eq!(result, Ok(()));
            assert_eq!(contract.get_total_payments(), 1);
        }

        #[ink::test]
        fn record_payment_zero_amount_fails() {
            let mut contract = PaymentRecorder::new();
            let recipient = AccountId::from([0x01; 32]);

            let result = contract.record_payment(recipient, 0, None);
            assert_eq!(result, Err(Error::ZeroAmount));
        }

        #[ink::test]
        fn get_payment_history_works() {
            let mut contract = PaymentRecorder::new();
            let recipient = AccountId::from([0x01; 32]);
            let amount = 1000;

            contract.record_payment(recipient, amount, None).unwrap();

            let history = contract.get_my_payment_history();
            assert_eq!(history.len(), 1);
            assert_eq!(history[0].recipient, recipient);
            assert_eq!(history[0].amount, amount);
        }

        #[ink::test]
        fn get_payment_count_works() {
            let mut contract = PaymentRecorder::new();
            let recipient = AccountId::from([0x01; 32]);
            let caller = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().alice;

            assert_eq!(contract.get_payment_count(caller), 0);

            contract.record_payment(recipient, 1000, None).unwrap();
            assert_eq!(contract.get_payment_count(caller), 1);

            contract.record_payment(recipient, 2000, None).unwrap();
            assert_eq!(contract.get_payment_count(caller), 2);
        }
    }
}