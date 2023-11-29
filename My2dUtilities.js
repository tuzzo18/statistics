"use strict";

class My2dUtilities {

  static transformXYToViewport([x, y], min_x, range_x, min_y, range_y, rectView) {
    return (
      [
        My2dUtilities.transformX(x, min_x, range_x, rectView.x, rectView.width),
        My2dUtilities.transformY(y, min_y, range_y, rectView.y, rectView.height)
      ]
    )
  }

  static transformX(x, min_x, range_x, left, width) {
    return left + width * (x - min_x) / range_x;
  }

  static transformY(y, min_y, range_y, top, height) {
    return top + height - (height * (y - min_y) / range_y);
  }
}
