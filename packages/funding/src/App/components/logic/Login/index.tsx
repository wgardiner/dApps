import {
  loadLedgerWallet,
  loadOrCreateWallet,
  RedirectLocation,
  useAccount,
  useError,
  useSdk,
  WalletLoader,

} from "@cosmicdapp/logic";
import { Button, Typography, Modal, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { PageLayout } from "../../layout/PageLayout";
import { Loading } from "../../logic/Loading";
import { ErrorText, LightText, MainStack, WelcomeStack } from "./style";
import { OfflineSigner } from '@cosmjs/launchpad';

const { TextArea } = Input;
const { Title } = Typography;

function disableLedgerLogin() {
  const anyNavigator: any = navigator;
  return !anyNavigator?.usb;
}

interface LoginProps {
  readonly pathAfterLogin: string;
  readonly appName: string;
  readonly appLogo: string;
  readonly addressPrefix?: string;
}

export function Login({ addressPrefix, pathAfterLogin, appName, appLogo }: LoginProps): JSX.Element {
  const history = useHistory();
  const state = history.location.state as RedirectLocation;
  const { error, setError, clearError } = useError();
  const sdk = useSdk();
  const { refreshAccount, account } = useAccount();

  const [initializing, setInitializing] = useState(false);

  // const [modalIsVisible, setModalIsVisible] = useState(false);
  const [mnemonic, setMnemonic] = useState('');

  async function init(loadWallet: WalletLoader) {
    setInitializing(true);
    clearError();

    try {
      const signer = await loadWallet(addressPrefix);
      await sdk.init(signer);
    } catch (error) {
      console.error(error);
      setError(Error(error).message);
      setInitializing(false);
    }
  }

  async function initBrowser() {
    await init(loadOrCreateWallet);
  }

  // async function loadOrCreateWalletFromMnemonic(addressPrefix?: string): Promise<OfflineSigner> {
  //   const mnemonic = loadOrCreateMnemonic();
  //   const hdPath = makeCosmoshubPath(0);
  //   const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, hdPath, addressPrefix);
  //   return wallet;
  // }

  async function initBrowserWithMnemonic() {
    localStorage.setItem('burner-wallet', mnemonic);
    await initBrowser();
  }

  async function initLedger() {
    await init(loadLedgerWallet);
  }

  // function onModalOk() {
  //   localStorage.setItem('burner-wallet', mnemonic);
  //   setModalIsVisible(false);
  // }

  // function onModalCancel() {
  //   setModalIsVisible(false);
  // }

  function onMnemonicChange({ target: { value } }) {
    setMnemonic(value);
  }

  useEffect(() => {
    if (sdk.initialized) {
      refreshAccount();
    }
  }, [sdk.initialized, refreshAccount]);

  useEffect(() => {
    if (account) {
      if (state) {
        history.push(state.redirectPathname, state.redirectState);
      } else {
        history.push(pathAfterLogin);
      }
    }
  }, [account, state, history]);

  return initializing ? (
    <Loading loadingText="Initializing app..." />
  ) : (
    <PageLayout>
      <MainStack>
        {/* <img src={appLogo} alt="CosmWasm logo" /> */}
        <WelcomeStack>
          <Typography>
            <Title level={2}>Funding</Title>
            {/* <LightText>Welcome to your {appName}</LightText> */}
          </Typography>
          {error && <ErrorText>{error}</ErrorText>}



          { localStorage.getItem('burner-wallet') ? (
              <Button type="primary" onClick={initBrowser}>
                Login (saved)
              </Button>
            ) : (
              <>
                <LightText>Enter your mnemonic to login or create a new account</LightText>
                <TextArea onChange={onMnemonicChange} value={mnemonic} />
                <Button type="primary" onClick={initBrowserWithMnemonic}>
                  Login
                </Button>
                <Button type="primary" onClick={initBrowser}>
                  Create Account
                </Button>
              </>

          )}
          {/* <Button type="primary" disabled={disableLedgerLogin()} onClick={initLedger}>
            Ledger (Secure)
          </Button>
          <Button type="primary" disabled>
            Keplr (Secure)
          </Button> */}
          {/* <Modal visible={modalIsVisible} onOk={onModalOk} onCancel={onModalCancel}>
            <TextArea onChange={onMnemonicChange} value={mnemonic} />
          </Modal> */}
        </WelcomeStack>
      </MainStack>
    </PageLayout>
  );
}
