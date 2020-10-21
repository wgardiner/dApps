import { PageLayout, YourAccount } from "@cosmicdapp/design";
import { useError, useSdk } from "@cosmicdapp/logic";
import { Contract } from "@cosmjs/cosmwasm";
import { Button, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { config } from "../../../config";
import { pathContract } from "../../paths";
import { ContractStack, MainStack } from "./style";

const { Title } = Typography;

export function Home(): JSX.Element {
  const { setError } = useError();
  const { getClient } = useSdk();

  const [contracts, setContracts] = useState<readonly Contract[]>([]);

  useEffect(() => {
    getClient()
      .getContracts(config.codeId)
      .then((contracts) => setContracts(contracts))
      .catch(setError);
  }, [getClient, setError]);

  return (
    <PageLayout>
      <MainStack>
        <Title>Funding</Title>
        <ContractStack tag="nav">
          {contracts.map(({ label, address }) => (
            <Link key={address} to={`${pathContract}/${label.toLowerCase()}/${address}`}>
              <Button type="primary">{label}</Button>
            </Link>
          ))}
        </ContractStack>
        <YourAccount tag="footer" />
      </MainStack>
    </PageLayout>
  );
}
