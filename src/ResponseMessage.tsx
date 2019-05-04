import * as React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
  children: React.ReactNode;
}

const Empty = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100px;
`;

const EmptyInner = styled.div`
  padding: 10px 20px;
  font-size: 13px;
  color: #A3ACC5;
  background-color: #FBFBFF;
`;

export const ResponseMessage: React.FunctionComponent<Props> = ({ className, children }) => (
  <Empty className={className}>
    <EmptyInner>
      {children}
    </EmptyInner>
  </Empty>
);
