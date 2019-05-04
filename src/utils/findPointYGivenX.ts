export const findLengthAtGivenX = (path: SVGPathElement, givenX: number) => {
  const pathLength = path.getTotalLength();
  let start = 0;
  let end = pathLength;
  let target = (start + end) / 2;

  while (target >= start && target <= pathLength) {
    const targetPoint = path.getPointAtLength(target);

    if (Math.abs(targetPoint.x - givenX) < 0.1) {
      return target;
    } else if (targetPoint.x > givenX) {
      end = target;
    } else {
      start = target;
    }

    target = (start + end) / 2;
  }
};
