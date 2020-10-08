import { PageLayout } from "@cosmicdapp/design";
import { Typography } from "antd";
import React from "react";
import { useParams } from "react-router-dom";
import { HeaderBackMenu } from "../../components/HeaderBackMenu";
import { useStakingValidator } from "../../utils/staking";
import { FormWithdrawBalance } from "./FormWithdrawBalance";
import { HeaderTitleStack, MainStack } from "./style";

const { Title } = Typography;

interface WithdrawParams {
  readonly validatorAddress: string;
}

export function Withdraw(): JSX.Element {
  const { validatorAddress } = useParams<WithdrawParams>();
  const validator = useStakingValidator(validatorAddress);

  return (
    <PageLayout>
      <MainStack>
        <HeaderTitleStack>
          <HeaderBackMenu />
          <Title>Withdraw</Title>
          <Title level={2}>{validator?.description.moniker ?? ""}</Title>
        </HeaderTitleStack>
        <FormWithdrawBalance validator={validator} />
      </MainStack>
    </PageLayout>
  );
}
