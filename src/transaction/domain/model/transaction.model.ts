export class Transaction{
    constructor(
        public id: number,
        public transactionNumber: string,
        public status: string,
        public userEmail: string,
        public amount: number
    ){}
}