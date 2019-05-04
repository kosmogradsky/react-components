import * as React from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';

export interface ModalProps {
  className?: string;
  hasOverlay?: boolean;
  style?: React.CSSProperties;
  isOpen: boolean;
  onRequestClose?: (payload: React.MouseEvent) => void;
  id?: string;
}

const modalStyles = css`
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
`;

const Overlay = styled.button`
  position: absolute;
  display: block;
  opacity: 0;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const ModalWithoutOverlayWrapper = styled.div`
  ${modalStyles};
`;

const ModalWrapper = styled.div`
  ${modalStyles};
  bottom: 0;
  right: 0;
`;

export const Modal: React.FunctionComponent<ModalProps> = ({
  isOpen,
  hasOverlay = true,
  onRequestClose,
  className,
  style,
  children,
  id,
}) => isOpen ? createPortal(
  hasOverlay ? (
    <ModalWrapper style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>
      <Overlay onClick={onRequestClose}>Закрыть</Overlay>
      <div
        className={className}
        style={{ ...style }}
        id={id}
      >
        {children}
      </div>
    </ModalWrapper>
  ) : (
    <ModalWithoutOverlayWrapper
      className={className}
      style={{ ...style }}
    >
      {children}
    </ModalWithoutOverlayWrapper>
  ),
  document.getElementById('#modal') as HTMLElement,
) : null;
