import { Login as LoginDesign } from "@cosmicdapp/design";
import React from "react";
import { pathTokens } from "../../paths";
import cosmWasmLogo from "./assets/cosmWasmLogo.svg";

export function Login(): JSX.Element {
  return <LoginDesign pathAfterLogin={pathTokens} appName="Wallet" appLogo={cosmWasmLogo} />;
}