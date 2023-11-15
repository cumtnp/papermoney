import matplotlib.pyplot as plt
import numpy as np

# Define the data for the years 2018 to 2021
years = np.array([2018, 2019, 2020, 2021])
revenues = np.array([10070678, 43516983, 60706928, 119654842])  # Removed the last element to match 'years'
costs = np.array([-4308354, -42423448, -36084487, -45222646])  # Removed the last element to match 'years'

# Create a plot
fig, ax1 = plt.subplots(figsize=(10, 6))

# Plot revenue
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Revenue (RMB)', color=color)
ax1.plot(years, revenues, color=color)
ax1.tick_params(axis='y', labelcolor=color)

# Instantiate a second axes that shares the same x-axis
ax2 = ax1.twinx()

# Plot cost on the same chart
color = 'tab:red'
ax2.set_ylabel('Cost (RMB)', color=color)
ax2.plot(years, costs, color=color)
ax2.tick_params(axis='y', labelcolor=color)

# Title and layout
plt.title('Revenue and Cost Change from 2018 to 2021')
fig.tight_layout()

# Show plot
plt.show()
