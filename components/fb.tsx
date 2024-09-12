/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

/**
 * support the selection of Facebook Pages after the user logs in via a popup
 */
import { useState, useEffect } from "react";

declare global {
  interface Window {
      FB: any;
      fbAsyncInit: any
  }
}

const FacebookPageSelector = () => {
  const [pages, setPages] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPage, setSelectedPage] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '379599191770485', // Replace with your Facebook App ID
          cookie: true,
          xfbml: true,
          version: 'v20.0'
        });
      };

      (function(d, s, id) {
        let js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode!.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    const cleanup = () => {
      (function (d, id) {
        let target = d.getElementById(id);
        if (target) {
          target.parentNode?.removeChild(target);
        }
      })(document, "facebook-jssdk");
    
      delete window.FB;
    }

    loadFacebookSDK();

    return () => {
      cleanup()
    }
  }, []);

  const handleFacebookLogin = async () => {
    try {
      // Open Facebook login popup
      // @ts-expect-error d d
      const response: FB.LoginStatusResponse = await new Promise((resolve, reject) => {
        window.FB.login((loginResponse: any) => {
          if (loginResponse.authResponse) {
            resolve(loginResponse);
          } else {
            reject("User cancelled login or did not fully authorize.");
          }
        }, { 
          redirectUri: 'https://admin-staging.workmetric.com',
          scope: 'pages_show_list,pages_read_engagement,instagram_basic,whatsapp_business_management,instagram_manage_messages,pages_manage_metadata,whatsapp_business_messaging' });
      });

      console.log('response: ', response)

      // Fetch user's Business
      // const businessResponse = await new Promise((resolve) => {
      //   window.FB.api('/me', (apiResponse: any) => {
      //     console.log('business: ', apiResponse)
      //     resolve(apiResponse.data)
      //   })
      // })
      // const businessResponse1 = await new Promise((resolve) => {
      //   window.FB.api('/me', (apiResponse: any) => {
      //     console.log('business: ', apiResponse)
      //     resolve(apiResponse.data)
      //   })
      // })

      // Fetch user's Facebook pages
      const pagesResponse: Array<{ id: string; name: string }> = await new Promise((resolve) => {
        window.FB.api('/me/accounts', (apiResponse: any) => {
          console.log('pages: ', apiResponse)
          resolve(apiResponse.data);
        });
      });

      setPages(pagesResponse);
    } catch (error) {
      console.error("Facebook login error:", error);
    }
  };

  const handlePageSelect = (page: { id: string; name: string }) => {
    setSelectedPage(page);
  };

  return (
    <div>
      <a href={`https://www.facebook.com/v20.0/dialog/oauth?
  client_id=379599191770485&redirect_uri=https://admin-staging.workmetric.com&state={"{st=state123abc,ds=123456789}"}`}>Login dialog</a>
      <button onClick={handleFacebookLogin}>Login with Facebook</button>
      {pages.length > 0 && (
        <div>
          <h3>Select a Facebook Page:</h3>
          <ul>
            {pages.map((page) => (
              <li key={page.id}>
                <button onClick={() => handlePageSelect(page)}>
                  {page.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedPage && (
        <div>
          <h3>Selected Page:</h3>
          <p>{selectedPage.name}</p>
        </div>
      )}
    </div>
  );
};

export default FacebookPageSelector;


