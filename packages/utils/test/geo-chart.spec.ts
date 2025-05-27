import { describe, it, expect } from 'vitest'
import { getGeoChartOptions } from '../src/geo-chart'

// Define a type for the config object based on its usage in the function
interface MockConfigColors {
  colors: {
    grays: {
      light: string
      DEFAULT: string // Note: In JS, 'DEFAULT' is a valid key, ensure it's handled as such
    }
    primary: string // In the source, colors.primary is directly used as a string
    // Add other potential color categories if they were used, e.g. secondary, accent etc.
  }
}

describe('getGeoChartOptions', () => {
  const mockConfig: MockConfigColors = {
    colors: {
      grays: {
        light: '#F3F4F6', // Example light gray
        DEFAULT: '#6B7280' // Example default gray
      },
      primary: '#FDBA74' // Example primary color (orange-ish)
    }
  }

  it('should return an object', () => {
    const options = getGeoChartOptions(mockConfig)
    expect(typeof options).toBe('object')
    expect(options).not.toBeNull()
  })

  it('should contain correct static properties and values', () => {
    const options = getGeoChartOptions(mockConfig)
    expect(options.sizeAxis).toEqual({ minValue: 0, maxValue: 100 })
    expect(options.backgroundColor).toEqual({
      fill: '#ffffff',
      stroke: '#ffffff',
      strokeWidth: 1
    })
    expect(options.legend).toBe('none')
    expect(options.keepAspectRatio).toBe(true)
    expect(options.width).toBe('100%') // Note: source has '100 + '%', which is '100%'
    expect(options.height).toBe('100%') // Note: source has '100 + '%', which is '100%'
    expect(options.tooltip).toEqual({
      isHtml: true,
      showTitle: false,
      textStyle: {
        color: '#ffffff'
      },
      backgroundColor: { fill: 'transparent' }
    })
  })

  it('should correctly use colors from config in colorAxis', () => {
    const options = getGeoChartOptions(mockConfig)
    expect(options.colorAxis).toBeDefined()
    expect(options.colorAxis.minValue).toBe(0)
    expect(options.colorAxis.maxValue).toBe(2)
    expect(options.colorAxis.colors).toEqual([
      mockConfig.colors.grays.light,
      mockConfig.colors.grays.DEFAULT,
      mockConfig.colors.primary
    ])
  })

  it('should correctly use grays.light from config for datalessRegionColor', () => {
    const options = getGeoChartOptions(mockConfig)
    expect(options.datalessRegionColor).toBe(mockConfig.colors.grays.light)
  })

  it('should throw an error if config.colors is undefined (accessing property of undefined)', () => {
    const invalidConfig = {} as MockConfigColors // Missing 'colors'
    expect(() => getGeoChartOptions(invalidConfig)).toThrowError(/Cannot read properties of undefined/)
  })

  it('should throw an error if nested color properties are missing', () => {
    const incompleteConfig1: any = {
      colors: {
        // grays is missing
        primary: '#FF0000'
      }
    }
    expect(() => getGeoChartOptions(incompleteConfig1)).toThrowError(/Cannot read properties of undefined/)
    
    const incompleteConfig2: MockConfigColors = {
      colors: {
        grays: {
          light: '#F0F0F0'
          // DEFAULT is missing, so colors.grays.DEFAULT will be undefined
        } as any, 
        primary: '#FF0000'
      }
    }
    // For incompleteConfig2, it should not throw, but options.colorAxis.colors[1] should be undefined
    const options2 = getGeoChartOptions(incompleteConfig2);
    expect(options2.colorAxis.colors).toEqual([
      incompleteConfig2.colors.grays.light, // '#F0F0F0'
      undefined,                            // colors.grays.DEFAULT is undefined
      incompleteConfig2.colors.primary      // '#FF0000'
    ]);
    expect(options2.datalessRegionColor).toBe(incompleteConfig2.colors.grays.light);


     const incompleteConfig3: MockConfigColors = {
      colors: {
        grays: {
          light: '#F0F0F0',
          DEFAULT: '#CCCCCC'
        },
        // primary is missing, so colors.primary will be undefined
      } as any
    }
    // For incompleteConfig3, it should not throw, but options.colorAxis.colors[2] should be undefined
    const options3 = getGeoChartOptions(incompleteConfig3);
    expect(options3.colorAxis.colors).toEqual([
      incompleteConfig3.colors.grays.light,    // '#F0F0F0'
      incompleteConfig3.colors.grays.DEFAULT,  // '#CCCCCC'
      undefined                                // colors.primary is undefined
    ]);
  })
  
  it('should handle different valid color values in config', () => {
    const differentConfig: MockConfigColors = {
      colors: {
        grays: {
          light: '#000000',
          DEFAULT: '#111111'
        },
        primary: '#222222'
      }
    }
    const options = getGeoChartOptions(differentConfig)
    expect(options.colorAxis.colors).toEqual([
      '#000000',
      '#111111',
      '#222222'
    ])
    expect(options.datalessRegionColor).toBe('#000000')
  })
})
