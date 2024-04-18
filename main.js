#! /usr/bin/env node 
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
class DataBase {
    accounts_db = {
        354364367: { pin: 1234, balance: 1000, name: "Dani", transcation_history: [], is_locked: false },
        353636363: { pin: 1234, balance: 1000, name: "John", transcation_history: [], is_locked: true },
        878328654: { pin: 1234, balance: 1000, name: "Jane", transcation_history: [], is_locked: false },
    };
}
class User extends DataBase {
    account = {};
    get_accounts(account_number) {
        return this.accounts_db[account_number];
    }
    get_account() {
        return this.account;
    }
    set_account(account_number, account) {
        this.account = account;
        this.accounts_db[account_number] = account;
    }
}
class UserAccount_Authentication extends User {
    savedAccountNum = 0;
    transaction;
    attepmts = 3;
    account = {};
    constructor() {
        super();
        this.transaction = new Transaction(this, this.account);
    }
    async user_login() {
        await inquirer.prompt([{
                type: 'number',
                name: 'account_number',
                message: 'Enter your account number: ',
            }]).then((answer) => {
            const account = this.get_accounts(answer.account_number);
            if (account) {
                this.savedAccountNum = answer.account_number;
                if (account.is_locked) {
                    console.log(chalk.red('Account is locked. Please contact the bank Support Service'));
                    return;
                }
                else {
                    this.account = account;
                    this.transaction = new Transaction(this, this.account);
                    this.user_pin();
                }
            }
            else {
                console.log(chalk.red('Account number not found'));
                this.user_login();
            }
        }).catch(() => {
            console.log(chalk.red('Please enter account number as a number'));
            this.user_login();
        });
    }
    async user_pin() {
        await inquirer.prompt([{
                type: 'number',
                name: 'pin',
                message: 'Enter your pin: ',
            }]).then((answer) => {
            if (answer.pin === this.account.pin) {
                console.log(chalk.green("Welcome " + this.account.name));
                this.transaction.user_options();
            }
            else {
                console.log(chalk.red('Invalid pin'));
                this.attepmts -= 1;
                if (this.attepmts > 0) {
                    console.log(chalk.red('Attempts left: ' + this.attepmts));
                    this.user_pin();
                }
                else {
                    this.account.is_locked = true;
                    console.log(chalk.red('Account is locked. Please contact the bank'));
                }
            }
        }).catch(() => {
            console.log(chalk.red('Please enter pin as a number'));
        });
    }
}
class Transaction extends User {
    userAccountAuthentication;
    constructor(userAccountAuthentication, account) {
        super();
        this.userAccountAuthentication = userAccountAuthentication;
        this.account = account;
    }
    async user_options() {
        console.log(chalk.green("Please select an option"));
        await inquirer.prompt([{
                type: 'list',
                name: 'option',
                message: 'Select an option',
                choices: ['Check Balance', 'Deposit', 'Withdraw', "Fast Withdrawl", 'Transaction_Logs', 'Exit']
            }]).then((answer) => {
            switch (answer.option) {
                case 'Check Balance':
                    this.balanceCheck();
                    break;
                case 'Deposit':
                    this.deposit();
                    break;
                case 'Withdraw':
                    this.withdraw();
                    break;
                case 'Transaction_Logs':
                    this.transaction_logs();
                    break;
                case 'Fast Withdrawl':
                    this.fast_withdraw();
                    break;
                case 'Exit':
                    console.log(chalk.green('Thank you for using our service'));
                    break;
            }
        }).catch(() => {
            console.log(chalk.red('An error occured'));
        });
    }
    async balanceCheck() {
        console.log(chalk.green('Your balance is: ' + this.account.balance));
        this.user_options();
    }
    async deposit() {
        await inquirer.prompt([{
                type: 'number',
                name: 'amount',
                message: 'Enter the amount you want to deposit: ',
            }]).then((answer) => {
            this.account.balance += answer.amount;
            this.account.transcation_history.push({ type: 'Deposit', amount: answer.amount });
            this.set_account(this.userAccountAuthentication.savedAccountNum, this.account);
            console.log(chalk.green('Deposit successful'));
            this.user_options();
        }).catch(() => {
            console.log(chalk.red('Please enter figures only'));
        });
        this.user_options();
    }
    async withdraw() {
        await inquirer.prompt([{
                type: 'number',
                name: 'amount',
                message: 'Enter the amount you want to withdraw: ',
            }]).then((answer) => {
            if (answer.amount > this.account.balance) {
                console.log(chalk.red('Insufficient funds'));
            }
            else {
                this.account.balance -= answer.amount;
                this.account.transcation_history.push({ type: 'Withdraw', amount: answer.amount });
                this.set_account(this.userAccountAuthentication.savedAccountNum, this.account);
                console.log(chalk.green('Withdrawal successful'));
            }
            this.user_options();
        }).catch(() => {
            console.log(chalk.red('Please enter figures only'));
        });
        this.user_options();
    }
    async fast_withdraw() {
        await inquirer.prompt([{
                type: 'list',
                name: 'amount',
                message: 'Select the amount you want to withdraw: ',
                choices: [100, 200, 500, 1000, 5000]
            }]).then((answer) => {
            this.account.balance -= answer.amount;
            console.log(chalk.green('Withdrawal successful'));
            this.account.transcation_history.push({ type: 'Withdraw', amount: answer.amount });
            this.set_account(this.userAccountAuthentication.savedAccountNum, this.account);
            this.user_options();
        }).catch(() => {
            console.log(chalk.red('An error occured'));
        });
    }
    ;
    async transaction_logs() {
        console.log(chalk.green('Transaction logs'));
        console.log(this.account.transcation_history);
        this.user_options();
    }
}
class ATM extends UserAccount_Authentication {
    async start() {
        console.log(chalk.green(figlet.textSync("Dani's ATM", { horizontalLayout: 'full', font: 'ANSI Shadow' })));
        await this.user_login();
    }
}
const atm = new ATM();
atm.start();
