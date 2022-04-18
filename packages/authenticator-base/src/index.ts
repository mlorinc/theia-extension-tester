// Authenticator object definition.
export interface Authenticator {
    authenticate: () => Promise<void>;
}
