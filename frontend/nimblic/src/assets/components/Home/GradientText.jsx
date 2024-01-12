const GradientText = ({ text }) => {
    // Define your color stops for the gradient
    const colorStopsBackground = [
      'hsl(262, 52%, 45%)', // --s: Start color
      'hsl(263, 45%, 55%)', // --sf: Second color
      'hsl(264, 38%, 45%)', // --pf: Midpoint color
      'hsl(265, 30%, 56%)', // --p: Pivot color
      'hsl(266, 24%, 59%)', // --a: End color
    ];

    const colorStopsText = [
      'hsl(262, 52%, 22%)', // --s: Start color
      'hsl(263, 35%, 27%)', // --sf: Second color
      'hsl(264, 58%, 38%)', // --pf: Midpoint color
      'hsl(265, 20%, 23%)', // --p: Pivot color
      'hsl(266, 64%, 32%)', // --a: End color
    ];
  
    const gradientCSSText = `linear-gradient(90deg, ${colorStopsText.join(', ')})`;
    const gradientCSSBackground = `linear-gradient(90deg, ${colorStopsBackground.join(', ')})`;
  
    return (
      <span className="inline-grid text-6xl font-nunito text-transparent bg-clip-text">
        <span
          className="pointer-events-none col-start-1 row-start-1 bg-clip-text opacity-50 blur-3xl"
          style={{
            backgroundImage: gradientCSSText,
            WebkitTextFillColor: 'transparent',
            transform: 'translate3d(0,0,0)'
          }}
          aria-hidden="true"
        >
          {text}
        </span>
        <span
          className="relative col-start-1 row-start-1 bg-clip-text"
          style={{
            backgroundImage: gradientCSSBackground,
            WebkitTextFillColor: 'transparent'
          }}
        >
          {text}
        </span>
      </span>
    );
  };
  
  export default GradientText;
  