import * as React from 'react';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';

import { LinearChartData } from './LinearChart';

interface Props {
  chartData: LinearChartData[];
  onChangeHoveredLabel: (index: number | undefined) => void;
  onFootnoteClick?: (token: string | undefined) => void;
  hoveredLabelIndex: number | undefined;
}

const InfoNoteButton = styled.button`
  position: relative;
  top: -10px;
  right: -10px;
  margin-left: -11px;
  padding: 1px 3px 2px 3px;
  width: 11px;
  height: 11px;
  border: 0;
  color: #5A6B8C;
  line-height: 11px;
  font-size: 8px;
  border-radius: 50%;
  background: none;

  &:hover {
    background-color: #1FB4A2;
    color: #fff;
    cursor: pointer;
    height: 11px;
    width: 11px;
  }
`;

const Legend = styled.div`
  margin-left: 20px;
`;

const LegendText = styled.span`
  line-height: 22px;
`;

export const LinearChartLegend = componentFromObservable<Props>('ComponentFromObservable', props$ => props$.pipe(
  map(props => {
    const { chartData, onChangeHoveredLabel, hoveredLabelIndex, onFootnoteClick } = props;

    const labels = Boolean(chartData.length)
      ? chartData[0].lines
      : [];

    const createHoverListeners = (index: number) => ({
      onMouseEnter: () => onChangeHoveredLabel(index),
      onMouseLeave: () => onChangeHoveredLabel(undefined),
    });

    return (
      <Legend>
        {labels.map((project, index) => (
          <div
            key={index}
            style={{
              opacity: hoveredLabelIndex === undefined || hoveredLabelIndex === index ? 1 : 0.2,
            }}
            {...createHoverListeners(index)}
          >
            <div
              style={{ backgroundColor: project.color }}
            />
            <LegendText>
              {project.name}
                {Boolean(project.token) ? (
                  <InfoNoteButton onClick={() => onFootnoteClick !== undefined ? onFootnoteClick(project.token) : {}} >
                    {project.token}
                  </InfoNoteButton>
                ) : undefined
              }
            </LegendText>
          </div>
        ))}
      </Legend>
    );
  }),
));
