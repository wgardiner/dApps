import { Button, Typography } from "antd";
import { Formik } from "formik";
import { Form, FormItem, Input } from "formik-antd";
import React from "react";
import * as Yup from "yup";
import { sendAddressValidationSchema } from "../../../forms/validationSchemas";
import { FormField, FormStack } from "./style";

const { Text } = Typography;

interface FormSendTokensProps {
  readonly tokenName: string;
  readonly tokenAmount: string;
  readonly sendTokensAction: (values: unknown) => void;
}

export function FormSendTokens({
  tokenName,
  tokenAmount,
  sendTokensAction,
}: FormSendTokensProps): JSX.Element {
  const sendAmountValidationSchema = Yup.object().shape({
    amount: Yup.number()
      .required("An amount is required")
      .positive("Amount should be positive")
      .max(parseFloat(tokenAmount), `Amount cannot be greater than ${tokenAmount}`),
  });

  const sendValidationSchema = sendAmountValidationSchema.concat(sendAddressValidationSchema);

  return (
    <Formik
      initialValues={{ amount: "", address: "" }}
      onSubmit={sendTokensAction}
      validationSchema={sendValidationSchema}
    >
      {(formikProps) => (
        <Form>
          <FormStack>
            <FormField>
              <Text>Send</Text>
              <FormItem name="amount">
                <Input name="amount" placeholder="Enter amount" />
              </FormItem>
              <Text>{tokenName}</Text>
            </FormField>
            <FormField>
              <Text>to</Text>
              <FormItem name="address">
                <Input name="address" placeholder="Enter address" />
              </FormItem>
            </FormField>
            <Button
              type="primary"
              onClick={formikProps.submitForm}
              disabled={!(formikProps.isValid && formikProps.dirty)}
            >
              Send
            </Button>
          </FormStack>
        </Form>
      )}
    </Formik>
  );
}
