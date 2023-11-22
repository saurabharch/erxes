import styled from 'styled-components';

export const Canvas = styled.div`
  .touchdevice-flow .react-flow__handle {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    background-color: #9f7aea;
  }

  .touchdevice-flow .react-flow__handle.connecting {
    animation: bounce 1600ms infinite ease-out;
  }

  @keyframes bounce {
    0% {
      transform: translate(0, -50%) scale(1);
    }
    50% {
      transform: translate(0, -50%) scale(1.1);
    }
  }
`;
