#![cfg(test)]

use super::*;
use ink::env::test;
use ink::env::DefaultEnvironment;

// Comprehensive test suite for EchoPay-2 Payment Recorder Contract

/// Test helper function to get default accounts
fn get_accounts() -> ink::env::test::DefaultAccounts<DefaultEnvironment> {
    test::default_accounts::<DefaultEnvironment>()
}

/// Test helper to set up contract with Alice as caller
fn setup_contract() -> PaymentRecorder {
    test::set_caller::<DefaultEnvironment>(get_accounts().alice);
    PaymentRecorder::new()
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    #[ink::test]
    fn constructor_initializes_correctly() {
        let contract = setup_contract();
        let (total_payments, total_users, total_commands) = contract.get_statistics();
        
        assert_eq!(total_payments, 0);
        assert_eq!(total_users, 0);
        assert_eq!(total_commands, 0);
        
        // Test security config initialization
        let config = contract.get_security_config(get_accounts().alice);
        assert!(!config.require_biometric);
        assert_eq!(config.rate_limit_per_hour, 100);
    }

    #[ink::test]
    fn record_payment_basic_functionality() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        let result = contract.record_payment(
            accounts.bob,
            1_000_000_000_000, // 1000 DOT in Planck
            "Send 1000 DOT to Bob".to_string(),
            Hash::from([1; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        
        assert!(result.is_ok());
        
        // Verify payment was recorded
        let history = contract.get_my_payment_history(0, 10);
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].recipient, accounts.bob);
        assert_eq!(history[0].amount, 1_000_000_000_000);
        assert_eq!(history[0].voice_command, "Send 1000 DOT to Bob");
        assert_eq!(history[0].currency, "DOT");
        assert_eq!(history[0].network, "polkadot");
    }

    #[ink::test]
    fn rate_limiting_prevents_spam() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Configure strict rate limiting
        let strict_config = SecurityConfig {
            require_biometric: false,
            rate_limit_per_hour: 2,
            max_amount_without_mfa: 1_000_000_000_000,
            replay_prevention_window: 300_000,
            admin_only_functions: false,
        };
        
        let _ = contract.configure_security(strict_config, Hash::from([10; 32]));
        
        // First two payments should succeed
        for i in 0..2 {
            let result = contract.record_payment(
                accounts.bob,
                1_000_000_000,
                format!("Payment {}", i),
                Hash::from([i as u8; 32]),
                "polkadot".to_string(),
                "DOT".to_string(),
                SecurityLevel::Basic,
            );
            assert!(result.is_ok());
        }
        
        // Third payment should fail due to rate limiting
        let result = contract.record_payment(
            accounts.bob,
            1_000_000_000,
            "Payment 3".to_string(),
            Hash::from([3; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        
        assert_eq!(result, Err(PaymentError::RateLimitExceeded));
    }

    #[ink::test]
    fn replay_attack_prevention() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        let duplicate_hash = Hash::from([42; 32]);
        
        // First transaction should succeed
        let result1 = contract.record_payment(
            accounts.bob,
            1_000_000_000,
            "First payment".to_string(),
            duplicate_hash,
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        assert!(result1.is_ok());
        
        // Second transaction with same hash should fail
        let result2 = contract.record_payment(
            accounts.charlie,
            2_000_000_000,
            "Replay attack attempt".to_string(),
            duplicate_hash, // Same hash as before
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        
        assert_eq!(result2, Err(PaymentError::ReplayAttackDetected));
    }

    #[ink::test]
    fn security_level_enforcement() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Configure to require biometric authentication
        let biometric_config = SecurityConfig {
            require_biometric: true,
            rate_limit_per_hour: 100,
            max_amount_without_mfa: 500_000_000_000, // 500 DOT
            replay_prevention_window: 300_000,
            admin_only_functions: false,
        };
        
        let _ = contract.configure_security(biometric_config, Hash::from([20; 32]));
        
        // Payment with basic security should fail
        let result = contract.record_payment(
            accounts.bob,
            1_000_000_000,
            "Payment requiring biometric".to_string(),
            Hash::from([30; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic, // Should fail because biometric required
        );
        
        assert_eq!(result, Err(PaymentError::InsufficientSecurity));
        
        // Payment with biometric security should succeed
        let result2 = contract.record_payment(
            accounts.bob,
            1_000_000_000,
            "Payment with biometric".to_string(),
            Hash::from([31; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Biometric, // Should succeed
        );
        
        assert!(result2.is_ok());
    }

    #[ink::test]
    fn mfa_required_for_large_amounts() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Large amount should require MFA
        let large_amount = 2_000_000_000_000; // 2000 DOT
        
        let result = contract.record_payment(
            accounts.bob,
            large_amount,
            "Large payment".to_string(),
            Hash::from([40; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic, // Insufficient for large amount
        );
        
        assert_eq!(result, Err(PaymentError::InsufficientSecurity));
        
        // Same amount with MFA should succeed
        let result2 = contract.record_payment(
            accounts.bob,
            large_amount,
            "Large payment with MFA".to_string(),
            Hash::from([41; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::MultiFactor, // Should succeed
        );
        
        assert!(result2.is_ok());
    }

    #[ink::test]
    fn contact_management_functionality() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Add contact
        let result = contract.add_contact(
            "Alice".to_string(),
            accounts.alice,
            Hash::from([50; 32]),
        );
        assert!(result.is_ok());
        
        // Verify contact was added
        let contacts = contract.get_my_contacts();
        assert_eq!(contacts.len(), 1);
        assert_eq!(contacts[0].name, "Alice");
        assert_eq!(contacts[0].address, accounts.alice);
        assert!(!contacts[0].is_verified);
        assert_eq!(contacts[0].payment_count, 0);
        
        // Try to add duplicate contact
        let duplicate_result = contract.add_contact(
            "Alice".to_string(),
            accounts.alice,
            Hash::from([51; 32]),
        );
        assert_eq!(duplicate_result, Err(PaymentError::ContactAlreadyExists));
        
        // Remove contact
        let remove_result = contract.remove_contact(
            "Alice".to_string(),
            Hash::from([52; 32]),
        );
        assert!(remove_result.is_ok());
        
        // Verify contact was removed
        let contacts_after = contract.get_my_contacts();
        assert_eq!(contacts_after.len(), 0);
    }

    #[ink::test]
    fn payment_status_updates() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Record initial payment
        let _ = contract.record_payment(
            accounts.bob,
            1_000_000_000,
            "Test payment".to_string(),
            Hash::from([60; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        
        // Update payment status
        let tx_hash = Hash::from([70; 32]);
        let update_result = contract.update_payment_status(
            0,
            PaymentStatus::Confirmed,
            Some(tx_hash),
        );
        assert!(update_result.is_ok());
        
        // Verify status was updated
        let history = contract.get_my_payment_history(0, 10);
        assert_eq!(history[0].status, PaymentStatus::Confirmed);
        assert_eq!(history[0].transaction_hash, Some(tx_hash));
    }

    #[ink::test]
    fn pagination_works_correctly() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Add multiple payments
        for i in 0..10 {
            let _ = contract.record_payment(
                accounts.bob,
                (i as u128 + 1) * 1_000_000_000,
                format!("Payment {}", i),
                Hash::from([i as u8 + 80; 32]),
                "polkadot".to_string(),
                "DOT".to_string(),
                SecurityLevel::Basic,
            );
        }
        
        // Test pagination
        let first_page = contract.get_my_payment_history(0, 5);
        let second_page = contract.get_my_payment_history(5, 5);
        
        assert_eq!(first_page.len(), 5);
        assert_eq!(second_page.len(), 5);
        
        // Verify different payments on each page
        assert_ne!(first_page[0].voice_command, second_page[0].voice_command);
    }

    #[ink::test]
    fn admin_functions_work() {
        let mut contract = setup_contract();
        let admin = get_accounts().alice;
        
        // Admin should be able to update global security
        let new_global_config = SecurityConfig {
            require_biometric: true,
            rate_limit_per_hour: 50,
            max_amount_without_mfa: 100_000_000_000,
            replay_prevention_window: 600_000,
            admin_only_functions: false,
        };
        
        let result = contract.update_global_security(new_global_config.clone());
        assert!(result.is_ok());
        
        // Verify global config was updated
        let retrieved_config = contract.get_security_config(get_accounts().bob);
        assert!(retrieved_config.require_biometric);
        assert_eq!(retrieved_config.rate_limit_per_hour, 50);
    }

    #[ink::test]
    fn emergency_pause_functionality() {
        let mut contract = setup_contract();
        
        // Admin should be able to emergency pause
        let result = contract.emergency_pause();
        assert!(result.is_ok());
        
        // Non-admin should fail to emergency pause
        test::set_caller::<DefaultEnvironment>(get_accounts().bob);
        let result2 = contract.emergency_pause();
        assert_eq!(result2, Err(PaymentError::Unauthorized));
    }

    #[ink::test]
    fn user_data_deletion_works() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Add some data first
        let _ = contract.record_payment(
            accounts.bob,
            1_000_000_000,
            "Test payment".to_string(),
            Hash::from([90; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        
        let _ = contract.add_contact(
            "Bob".to_string(),
            accounts.bob,
            Hash::from([91; 32]),
        );
        
        // Verify data exists
        assert_eq!(contract.get_my_payment_history(0, 10).len(), 1);
        assert_eq!(contract.get_my_contacts().len(), 1);
        
        // Delete user data
        let result = contract.delete_user_data(Hash::from([92; 32]));
        assert!(result.is_ok());
        
        // Verify data was deleted
        assert_eq!(contract.get_my_payment_history(0, 10).len(), 0);
        assert_eq!(contract.get_my_contacts().len(), 0);
    }

    #[ink::test] 
    fn voice_audit_logging() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Record payment to generate audit log
        let _ = contract.record_payment(
            accounts.bob,
            1_000_000_000,
            "Audited payment".to_string(),
            Hash::from([100; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        
        // Check audit logs
        let audit_logs = contract.get_voice_audit_logs(accounts.alice, 0, 10);
        assert_eq!(audit_logs.len(), 1);
        assert_eq!(audit_logs[0].command, "Audited payment");
        assert!(audit_logs[0].success);
        assert_eq!(audit_logs[0].security_level, SecurityLevel::Basic);
    }
}

#[cfg(test)]
mod integration_tests {
    use super::*;

    #[ink::test]
    fn full_payment_workflow() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Step 1: Configure security
        let security_config = SecurityConfig {
            require_biometric: false,
            rate_limit_per_hour: 10,
            max_amount_without_mfa: 1_000_000_000_000,
            replay_prevention_window: 300_000,
            admin_only_functions: false,
        };
        
        let _ = contract.configure_security(security_config, Hash::from([1; 32]));
        
        // Step 2: Add contacts
        let _ = contract.add_contact(
            "Bob".to_string(),
            accounts.bob,
            Hash::from([2; 32]),
        );
        
        // Step 3: Record payment
        let result = contract.record_payment(
            accounts.bob,
            500_000_000_000, // 500 DOT
            "Send 500 DOT to Bob".to_string(),
            Hash::from([3; 32]),
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        assert!(result.is_ok());
        
        // Step 4: Update payment status
        let _ = contract.update_payment_status(
            0,
            PaymentStatus::Confirmed,
            Some(Hash::from([4; 32])),
        );
        
        // Step 5: Verify complete workflow
        let history = contract.get_my_payment_history(0, 10);
        let contacts = contract.get_my_contacts();
        let audit_logs = contract.get_voice_audit_logs(accounts.alice, 0, 10);
        let (total_payments, total_users, total_commands) = contract.get_statistics();
        
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].status, PaymentStatus::Confirmed);
        assert_eq!(contacts.len(), 1);
        assert_eq!(audit_logs.len(), 1);
        assert_eq!(total_payments, 1);
        assert_eq!(total_users, 1);
        assert_eq!(total_commands, 1);
    }

    #[ink::test]
    fn stress_test_multiple_users() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        let users = [accounts.alice, accounts.bob, accounts.charlie];
        
        // Simulate multiple users making payments
        for (i, &user) in users.iter().enumerate() {
            test::set_caller::<DefaultEnvironment>(user);
            
            for j in 0..3 {
                let hash_bytes = [(i * 10 + j) as u8; 32];
                let result = contract.record_payment(
                    accounts.eve,
                    (j as u128 + 1) * 1_000_000_000,
                    format!("Payment from user {} #{}", i, j),
                    Hash::from(hash_bytes),
                    "polkadot".to_string(),
                    "DOT".to_string(),
                    SecurityLevel::Basic,
                );
                assert!(result.is_ok());
            }
        }
        
        // Verify statistics
        let (total_payments, total_users, total_commands) = contract.get_statistics();
        assert_eq!(total_payments, 9); // 3 users × 3 payments each
        assert_eq!(total_users, 3);
        assert_eq!(total_commands, 9);
        
        // Verify each user's history
        for &user in &users {
            let user_history = contract.get_payment_history(user, 0, 10);
            assert_eq!(user_history.len(), 3);
        }
    }
}

#[cfg(test)]
mod security_tests {
    use super::*;

    #[ink::test]
    fn unauthorized_admin_operations_fail() {
        let mut contract = setup_contract();
        
        // Switch to non-admin user
        test::set_caller::<DefaultEnvironment>(get_accounts().bob);
        
        // Unauthorized admin operations should fail
        let global_config = SecurityConfig {
            require_biometric: true,
            rate_limit_per_hour: 1,
            max_amount_without_mfa: 1,
            replay_prevention_window: 1,
            admin_only_functions: false,
        };
        
        assert_eq!(
            contract.update_global_security(global_config),
            Err(PaymentError::Unauthorized)
        );
        
        assert_eq!(
            contract.emergency_pause(),
            Err(PaymentError::Unauthorized)
        );
    }

    #[ink::test]
    fn hash_collision_handling() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        let collision_hash = Hash::from([255; 32]);
        
        // First payment with specific hash
        let result1 = contract.record_payment(
            accounts.bob,
            1_000_000_000,
            "First payment".to_string(),
            collision_hash,
            "polkadot".to_string(),
            "DOT".to_string(),
            SecurityLevel::Basic,
        );
        assert!(result1.is_ok());
        
        // Immediate replay should fail
        let result2 = contract.record_payment(
            accounts.charlie,
            2_000_000_000,
            "Collision attempt".to_string(),
            collision_hash,
            "westend".to_string(),
            "WND".to_string(),
            SecurityLevel::Basic,
        );
        assert_eq!(result2, Err(PaymentError::ReplayAttackDetected));
    }

    #[ink::test]
    fn input_validation() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Test with empty strings
        let result = contract.record_payment(
            accounts.bob,
            0, // Zero amount
            "".to_string(), // Empty command
            Hash::from([200; 32]),
            "".to_string(), // Empty network
            "".to_string(), // Empty currency
            SecurityLevel::Basic,
        );
        
        // Should still succeed as contract doesn't validate these
        // (validation should be done in frontend)
        assert!(result.is_ok());
        
        let history = contract.get_my_payment_history(0, 10);
        assert_eq!(history[0].amount, 0);
        assert_eq!(history[0].voice_command, "");
    }
}

// Performance and Gas Tests
#[cfg(test)]
mod performance_tests {
    use super::*;

    #[ink::test]
    fn gas_optimization_test() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Test gas usage for basic operations
        // Note: ink! doesn't provide gas measurement in tests,
        // but we can test operation efficiency
        
        let start_payments = contract.get_statistics().0;
        
        // Batch of payments
        for i in 0..50 {
            let _ = contract.record_payment(
                accounts.bob,
                1_000_000_000,
                format!("Batch payment {}", i),
                Hash::from([(i + 150) as u8; 32]),
                "polkadot".to_string(),
                "DOT".to_string(),
                SecurityLevel::Basic,
            );
        }
        
        let end_payments = contract.get_statistics().0;
        assert_eq!(end_payments - start_payments, 50);
        
        // Test pagination efficiency with large dataset
        let page1 = contract.get_my_payment_history(0, 10);
        let page5 = contract.get_my_payment_history(40, 10);
        
        assert_eq!(page1.len(), 10);
        assert_eq!(page5.len(), 10);
    }

    #[ink::test]
    fn storage_efficiency_test() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Test storage with maximum length strings
        let max_command = "A".repeat(1000); // Test with very long command
        let max_network = "polkadot-very-long-network-name".to_string();
        let max_currency = "DOT-EXTENDED-CURRENCY-NAME".to_string();
        
        let result = contract.record_payment(
            accounts.bob,
            u128::MAX, // Maximum balance
            max_command.clone(),
            Hash::from([250; 32]),
            max_network.clone(),
            max_currency.clone(),
            SecurityLevel::MultiFactor,
        );
        
        assert!(result.is_ok());
        
        let history = contract.get_my_payment_history(0, 1);
        assert_eq!(history[0].voice_command, max_command);
        assert_eq!(history[0].network, max_network);
        assert_eq!(history[0].currency, max_currency);
        assert_eq!(history[0].amount, u128::MAX);
    }
}
