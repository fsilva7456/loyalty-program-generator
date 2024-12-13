export const financialDriver = {
  name: 'Financial',
  description: 'This category evaluates the monetary aspects of the loyalty program, including costs, rewards value, and economic sustainability.',
  subDrivers: {
    rewardValue: {
      name: 'Reward Value',
      description: 'Monetary worth of rewards relative to spending required.'
    },
    programCosts: {
      name: 'Program Costs',
      description: 'Operational and reward fulfillment costs for the business.'
    },
    memberSavings: {
      name: 'Member Savings',
      description: 'Direct financial benefits and discounts for members.'
    },
    revenueImpact: {
      name: 'Revenue Impact',
      description: 'Effect on business revenue and customer lifetime value.'
    },
    costEfficiency: {
      name: 'Cost Efficiency',
      description: 'Balance between program costs and business benefits.'
    }
  }
};