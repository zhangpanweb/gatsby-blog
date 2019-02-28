import Typography from 'typography';
import deYoungTheme from 'typography-theme-de-young';

Object.assign(deYoungTheme, {
  bodyFontFamily: ['FZSHJW', 'Consolas', 'serif'],
  baseFontSize: '16px',
})

deYoungTheme.overrideStyles = ({ rhythm }) => ({
  'h6': { fontSize: '100%', },
  'h5': { fontSize: '120%', },
  'h4': { fontSize: '150%', },
  'h2': { fontSize: '200%' },
  'h2,h3,h4,h5,h6': {
    marginTop: rhythm(1.5)
  }
})

const typography = new Typography(deYoungTheme);

export default typography;