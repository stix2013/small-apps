interface ConfigColors {
  colors: { [key: string]: {
    [key: string]: string
  } };
}

export function getGeoChartOptions (config: ConfigColors) {
  const colors = config.colors

  return {
    sizeAxis: { minValue: 0, maxValue: 100 },
    // region: '155', // western europe
    backgroundColor: {
      fill: '#ffffff',
      stroke: '#ffffff',
      strokeWidth: 1
    },
    colorAxis: {
      minValue: 0,
      maxValue: 2,
      colors: [
        // '#d7d7c2',
        colors.grays.light,
        // '#baba97',
        colors.grays.DEFAULT,
        // '#fdcb08'
        colors.primary
      ]
    },
    // datalessRegionColor: '#D1D5DB',
    datalessRegionColor: colors.grays.light,
    legend: 'none',

    keepAspectRatio: true,
    width: 100 + '%',
    height: 100 + '%',
    tooltip: {
      isHtml: true,
      showTitle: false,
      textStyle: {
        color: '#ffffff'
      },
      backgroundColor: { fill: 'transparent' }
    }
  }
}
