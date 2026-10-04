export interface UserDao {
    getUserBalanceById(id: string): Promise<number>;
}
