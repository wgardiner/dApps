// import { Login as LoginDesign } from "@cosmicdapp/design";
import { Login as LoginDesign } from '../../components/logic/Login';
import React from 'react';
import { config } from '../../../config';
import { pathHome } from '../../paths';
import cosmWasmLogo from './assets/cosmWasmLogo.svg';

export function Login(): JSX.Element {
	return (
		<LoginDesign
			pathAfterLogin={pathHome}
			appName="Funding"
			appLogo={cosmWasmLogo}
			addressPrefix={config.addressPrefix}
		/>
	);
}
