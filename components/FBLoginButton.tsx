'use client'

import Script from "next/script"
import { useEffect } from "react"

export const FBLoginButton = () => {


  useEffect(() => {
    window.addEventListener('message', (event) => {
      const isValidOrigin = [
        'https://www.facebook.com',
        'https://web.facebook.com',
      ].includes(event.origin)

      if (!isValidOrigin) return

      try {
        console.log('event.data: ', event.data)
        const data = JSON.parse(event.data)
        if (data.type !== 'WA_EMBEDDED_SIGNUP') return

        // if user finishes the Embedded Signup flow
        switch (data.event) {
          case 'FINISH':
            const { phone_number_id, waba_id } = data.data

            localStorage.setItem(
              'wa_account',
              JSON.stringify({ phone_number_id, waba_id })
            )
            break

          case 'CANCEL':
            const { current_step } = data.data
            console.warn('Cancel at ', current_step)
            break

          case 'ERROR':
            const { error_message } = data.data
            console.error('error ', error_message)
            break

          default:
            console.log('Unknown event')
            break
        }
      } catch {
        console.log('Non JSON Responses', event.data)
      }
    })
  }, [])
    const handleLogin = async () => {
        try {
            // @ts-expect-error todo
            const response: FB.LoginStatusResponse = await new Promise(
                (resolve, reject) => {
                  // @ts-expect-error todo
                  FB.login(
                    (loginResponse: Record<string, string>) => {
                      if (loginResponse.authResponse) {
                        resolve(loginResponse)
                      } else {
                        reject(
                          new Error('User cancelled login or did not fully authorize.')
                        )
                      }
                    },
                    {
                          config_id: '427148496608877', // configuration ID goes here
                          response_type: 'code', // must be set to 'code' for System User access token
                          override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
                          extras: {
                            setup: {},
                            featureType: '',
                            sessionInfoVersion: '2',
                          },
                        }
                  )
                }
              )
        
              const { accessToken, expiresIn, code } = response?.authResponse || {}
              console.log(accessToken, expiresIn, code)
              // Fetch user's Facebook pages
          const pagesResponse: Array<{ id: string; name: string }> =
          await new Promise((resolve) => {
            window.FB.api('/me/accounts', (apiResponse: { data: Array<{ id: string; name: string }> }) => {
              resolve(apiResponse.data)
            })
          })
          console.log(pagesResponse)
        } catch (error) {
            console.error(error)
        }
    }

    return (
    <>
    <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.fbAsyncInit = function () {
            // @ts-expect-error todo
            FB.init({
              appId: '379599191770485',
              cookie: true,
              xfbml: true,
              version: 'v20.0',
            })
          }
        }}
      />
    <button onClick={handleLogin}>Login with Facebook</button>
    </>
    )
}
