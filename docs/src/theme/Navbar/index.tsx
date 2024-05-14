import React from 'react';
import Navbar from '@theme-original/Navbar';
import type NavbarType from '@theme/Navbar';
import type { WrapperProps } from '@docusaurus/types';
import CookieConsent from 'react-cookie-consent';

type Props = WrapperProps<typeof NavbarType>;

export default function NavbarWrapper(props: Props): JSX.Element {
  return (
    <div>
      <CookieConsent
        location="top"
        style={{position: 'inherit', background: '#f9fcdb', color: 'black'}}
        buttonText="Agree"
        enableDeclineButton
        declineButtonText="Decline"
        setDeclineCookie>
        This website uses cookies to enhance the user experience.
      </CookieConsent>
      <Navbar {...props} />
    </div>
  );
}
