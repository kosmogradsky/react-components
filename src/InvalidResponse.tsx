import * as React from 'react';

import { ResponseMessage } from './ResponseMessage';

interface Props {
  className?: string;
}

export const InvalidResponse: React.FunctionComponent<Props> = ({ className }) => (
  <ResponseMessage className={className}>Данные, пришедшие c сервера, не соответствуют ожидаемому формату</ResponseMessage>
);
