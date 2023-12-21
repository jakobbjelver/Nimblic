Correlation Network

### **Understanding the Process**

A Correlation Network is a graphical representation of correlation between different variables in your dataset. In our app, this is achieved through a series of steps involving **network construction and correlation calculation**.

### **Building the Network**

The app constructs a network using your data, where each variable is a node. It then calculates the correlation between each pair of variables. We use Spearman's rank correlation for this, which is effective for both numeric and ordinal data.

### **Visualizing Relationships**

Once the correlations are calculated, the app visualizes them as edges in the network. Edges represent the strength of the relationship - the stronger the correlation, the stronger the connection. 

### **Influence in Detail**

In a Correlation Network, **Influence** refers to the overall impact a variable (node) has within the network. It's calculated based on how strongly that node is connected to others. High influence suggests that the variable is a key driver in the relationships within your data.

### **Understanding Weight**

**Weight** represents the strength of the correlation between two variables (nodes). It quantifies how closely these variables are related. In practice, a higher weight indicates a more significant or stronger relationship, which can be pivotal in statistical analysis.

### **Degree Explained**

The **Degree** of a node is essentially the count of its direct connections. In correlation networks, this indicates how many other variables a particular variable is directly correlated with. A higher degree suggests a variable that interacts with many others, potentially influencing them.
&nbsp;  
&nbsp;  
**Pro Tip:** Use this network to identify key variables that are highly interconnected. This can guide you in focusing your analysis on the most influential parts of your data.
