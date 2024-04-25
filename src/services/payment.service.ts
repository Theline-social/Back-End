import axios from 'axios';

const token: string = process.env.PAYMENT_FATOORAH_DEV_API_KEY as string;
const baseURL: string = 'https://apitest.myfatoorah.com';

const initiatePayment = (): void => {
  const options = {
    method: 'POST',
    url: `${baseURL}/v2/InitiatePayment`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: { InvoiceAmount: 100, CurrencyIso: 'KWD' },
  };

  axios(options)
    .then((response) => console.log(response.data))
    .catch((error) => console.error(error));
};

const executePayment = (): void => {
  const options = {
    method: 'POST',
    url: `${baseURL}/v2/ExecutePayment`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      PaymentMethodId: '2',
      CustomerName: 'Ahmed',
      DisplayCurrencyIso: 'KWD',
      MobileCountryCode: '+965',
      CustomerMobile: '12345678',
      CustomerEmail: 'xx@yy.com',
      InvoiceValue: 100,
      CallBackUrl: 'https://theline.social',
      ErrorUrl: 'https://theline.social',
      Language: 'en',
      CustomerReference: 'ref 1',
      CustomerCivilId: 12345678,
      UserDefinedField: 'Custom field',
      ExpireDate: '',
      CustomerAddress: {
        Block: '',
        Street: '',
        HouseBuildingNo: '',
        Address: '',
        AddressInstructions: '',
      },
      InvoiceItems: [{ ItemName: 'Product 01', Quantity: 1, UnitPrice: 100 }],
    },
  };

  axios(options)
    .then((response) => console.log(response.data))
    .catch((error) => console.error(error));
};


export { initiatePayment, executePayment }