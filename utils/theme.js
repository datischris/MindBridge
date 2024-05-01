const lightTheme = {
    background: "white",
    text: "black",
    activeDot: "black",
    button: "black",
    buttonText: "white",
    todayWorkoutContainer: "#000000",
    unfillColor: "white",
    cancelIconColor: "white",
    widgetText: "white",
    progressBar: "#666666",
    defaultMast: "#E2E2E2",
    notLiked: "gray",
    liked: "white",
    placeholderTextColor: "#BBBBBB",
    timerBackground: "#EFEFEF", 
    timerText: "black", 
    timerStrokeActive: "#4CAF50", 
    timerStrokeInactive: "#CCCCCC", 
    workoutPlan: "#F6F6F6",
    liftCard: "rgba(0,0,0.5)",
  };
  
  const darkTheme = {
    background: "black",
    text: "white",
    activeDot: "white",
    button: "white",
    buttonText: "black",
    todayWorkoutContainer: "white",
    unfillColor: "black",
    cancelIconColor: "black",
    widgetText: "black",
    progressBar: "#C8C8C8",
    defaultMast: "#2F2B2E",
    notLiked: "gray",
    liked: "white",
    registerButton: "#232323",
    placeholderTextColor: "#383838",
    timerBackground: "#333333", 
    timerText: "white",
    timerStrokeActive: "#4CAF50", 
    timerStrokeInactive: "#666666",
    workoutPlan: "#222222",
    liftCard: "rgba(0,0,0,.8)",

  };
  
  export default theme = (mode) => (mode === "light" ? lightTheme : darkTheme);