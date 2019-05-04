import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import * as b from './styles/buttons';

const Wrapper = styled.div`
  overflow: hidden;
  height: 100%;
  min-height: 600px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: auto;
  width: 50%;
  padding-bottom: 100px;
`;

const Info = styled.div`
  color: #5A6B8C;
  font-size: 24px;
  line-height: 39px;
  margin-bottom: 20px;
`;

const ReturnButton = styled(Link)`
  ${b.button};
`;

export const PageNotFound: React.FunctionComponent = () =>
  <Wrapper>
    <Container>
      <Info>Страница не найдена</Info>
      <ReturnButton to={'/'}>Вернуться на главную</ReturnButton>
    </Container>
  </Wrapper>;
