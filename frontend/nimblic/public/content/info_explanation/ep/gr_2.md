Recommended Graphs

### **Understanding the Process**

A Correlation Network is a graphical representation of correlation between different variables in your dataset. In our app, this is achieved through a series of steps involving **network construction and correlation calculation**.

### **Building the Network**

The app constructs a network using your data, where each variable is a node. It then calculates the correlation between each pair of variables. We use Spearman's rank correlation for this, which is effective for both numeric and ordinal data.

### **Visualizing Relationships**

Once the correlations are calculated, the app visualizes them as edges in the network. Edges represent the strength of the relationship - the stronger the correlation, the stronger the connection. 
&nbsp;  
&nbsp;  
**Pro Tip:** Use this network to identify key variables that are highly interconnected. This can guide you in focusing your analysis on the most influential parts of your data.