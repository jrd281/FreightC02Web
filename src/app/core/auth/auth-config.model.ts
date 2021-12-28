export interface AuthConfigModel {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: string;

        // REQUIRED - Amazon Cognito Region
        region: string;

        // OPTIONAL - Amazon Cognito Federated Identity Pool Region
        // Required only if it's different from Amazon Cognito Region
        identityPoolRegion: string;

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: string;

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: string;

        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: boolean;

        // OPTIONAL - Configuration for cookie storage
        // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
        cookieStorage: {
            // REQUIRED - Cookie domain (only required if cookieStorage is provided)
            domain: string;
            // OPTIONAL - Cookie path
            path: string;
            // OPTIONAL - Cookie expiration in days
            expires: number;
            // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
            sameSite: string;
            // OPTIONAL - Cookie secure flag
            // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
            secure: boolean;
        };

        // OPTIONAL - customized storage object
        storage: object;

        // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
        authenticationFlowType: string;

        // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
        clientMetadata: object;

        oauth: {
            domain: string;
            scope: string[];
            redirectSignIn: string;
            redirectSignOut: string;
            responseType: string;
        };
    };
}
