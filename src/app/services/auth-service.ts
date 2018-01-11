import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { constants } from '../app.constants';
import Auth0Lock from 'auth0-lock';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../components/parts/error-dialog/error-dialog.component';
import * as jwtDecode from 'jwt-decode';
import * as LogRocket from 'logrocket';

export const expiredAtKey = 'expired_at';
export const uidKey = 'uid';

@Injectable()
export class Auth {
    lock = new Auth0Lock(environment.auth0ClientId, environment.auth0Domain, {
        theme: {
            logo: constants.GARVAN_KCCG_LOGO,
            primaryColor: constants.PRIMARY_COLOR,
        },
        languageDictionary: {
            title: ''
        },
        avatar: null,
        autoclose: true,
        auth: {
            redirectUrl: constants.ORIGIN_URL + 'initiatives',
            responseType: 'token id_token',
            params: {
                scope: 'openid email'
            }
        }
    });

    constructor(private router: Router,
                public dialog: MatDialog) {

        this.lock.on('authenticated', (authResult: any) => {
            try {
                if (authResult.idToken && authResult.idToken !== 'undefined') {
                    this.setSession(authResult);
                }
            } catch (e) {
                if (!environment.production) {
                    console.log(e)
                }
                window.setTimeout(() => {
                    this.dialog.open(
                        ErrorDialogComponent,
                        { data: "An error occurred while trying to authenticate. Please ensure private browsing is disabled and try again."}
                    );
                }, 100);
            }
        });

        this.lock.on('unrecoverable_error', (authResult: any) => {
            this.clearLocalStorage();
            window.setTimeout(() => {
                this.dialog.open(
                    ErrorDialogComponent,
                    { data: "An error occurred while trying to authenticate. Please ensure private browsing is disabled and try again."}
                );
            }, 100);
        });

        LogRocket.identify(localStorage.getItem(uidKey));

    }

    public login() {
        this.lock.show({
            auth: {
                params: {
                    state: this.router.url,
                    scope: 'openid email'
                },
            },
            initialScreen: 'login'
        });
    };

    public signUp() {
        this.lock.show({
            auth: {
                params: {
                    state: this.router.url,
                    scope: 'openid email'
                },
            },
            initialScreen: 'signUp'
        });
    }

    public authenticated() {
        const exp = localStorage.getItem(expiredAtKey);
        if (!exp) {
            return false;
        }
        const expiresAt = JSON.parse(localStorage.getItem(expiredAtKey));
        return new Date().getTime() < expiresAt;
    };

    public logout() {
        this.clearLocalStorage();
        window.location.href = `https://${ environment.auth0Domain }/v2/logout?returnTo=${ constants.ORIGIN_URL }`;
    };

    private setSession(authResult): void {
        const idToken = jwtDecode(authResult.idToken);
        localStorage.setItem(uidKey, authResult.idTokenPayload.email);
        const expiresAt = JSON.stringify(idToken.exp * 1000);
        LogRocket.identify(localStorage.getItem(uidKey));
        localStorage.setItem(expiredAtKey, expiresAt);
        window.setTimeout(() => {
            this.router.navigateByUrl(decodeURIComponent(authResult.state));
        }, 100);
    }

    clearLocalStorage() {
        localStorage.removeItem(expiredAtKey);
        localStorage.removeItem(uidKey);
    }
}
