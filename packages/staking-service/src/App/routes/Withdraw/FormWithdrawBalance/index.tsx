import { Button, Typography } from "antd";
import { Formik } from "formik";
import { Form, FormItem, Input } from "formik-antd";
import React from "react";
import { FormField, FormStack } from "./style";
import { StakingValidator } from "../../../utils/staking";
import { useAccount, useSdk, displayAmountToNative } from "@cosmicdapp/logic";
import { config } from "../../../../config";
import { Coin, coins } from "@cosmjs/launchpad";
import { MsgUndelegate } from "@cosmjs/launchpad/types/msgs";

const { Text } = Typography;

interface FormWithdrawBalanceFields {
  readonly amount: string;
}

interface FormWithdrawBalanceProps {
  readonly validator: StakingValidator;
}

export function FormWithdrawBalance({ validator }: FormWithdrawBalanceProps): JSX.Element {
  const { account } = useAccount();
  const { getClient } = useSdk();

  function submitWithdrawBalance({ amount }: FormWithdrawBalanceFields) {
    const nativeAmountString = displayAmountToNative(amount, config.coinMap, config.stakingToken);
    const nativeAmountCoin: Coin = { amount: nativeAmountString, denom: config.stakingToken };

    const delegateMsg: MsgUndelegate = {
      type: "cosmos-sdk/MsgUndelegate",
      value: {
        delegator_address: account.address,
        validator_address: validator.operator_address,
        amount: nativeAmountCoin,
      },
    };

    const defaultFee = {
      amount: coins(37500, config.feeToken),
      gas: "1500000", // 1.5 million
    };

    getClient()
      .signAndBroadcast([delegateMsg], defaultFee)
      .then((result) => {
        console.log(result);
      })
      .catch(console.error);
  }

  return (
    <Formik initialValues={{ amount: "" }} onSubmit={submitWithdrawBalance}>
      {(formikProps) => (
        <Form>
          <FormStack>
            <FormField>
              <Text>Atom</Text>
              <Text>1000,000</Text>
            </FormField>
            <FormField>
              <Text>Withdraw</Text>
              <FormItem name="amount">
                <Input name="amount" placeholder="Enter amount" />
              </FormItem>
            </FormField>
            <Button
              type="primary"
              onClick={formikProps.submitForm}
              disabled={!(formikProps.isValid && formikProps.dirty)}
            >
              Withdraw
            </Button>
          </FormStack>
        </Form>
      )}
    </Formik>
  );
}
