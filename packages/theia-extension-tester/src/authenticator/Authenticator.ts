
export interface Authenticator {
    authenticate: () => Promise<void>;
}
