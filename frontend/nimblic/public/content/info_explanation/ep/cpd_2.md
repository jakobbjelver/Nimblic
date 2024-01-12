Change Point Detection

### **Understanding the Algorithm**

Change Point Detection is an **analytical method** used to identify significant changes in a dataset. This method is particularly useful in time series analysis for detecting shifts in patterns or trends.

In our app, we use the **`ruptures` library** with the Binseg algorithm. This algorithm segments data and looks for points where there's a substantial difference in the mean values. 
 
### **Calculating Significance**

Each change point's significance is calculated based on the mean values and standard deviation. This helps in determining the **relevance** of each detected change.
 
### **Visual Representation**

The line graph in our app shows these change points, providing a clear visual of potential shifts in your data. This is a powerful tool for deeper understanding and analysis of data patterns.
&nbsp;  
&nbsp;  
**Pro Tip:** Pay attention to how these points correlate with external events or changes in your operation for more **insightful analysis**.
