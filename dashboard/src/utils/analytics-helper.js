import moment from 'moment';

export const generateDemandForecast = (historicalData) => {
    const periods = 7;
    if (!Array.isArray(historicalData) || historicalData.length < periods) {
        return [];
    }

    return historicalData.map((data, index, array) => {
        if (index < periods - 1) return null;
        const sum = array.slice(index - periods + 1, index + 1)
            .reduce((a, b) => a + (b.salesCount || 0), 0);
        return {
            date: data.date,
            predictedSales: Math.round(sum / periods)
        };
    }).filter(item => item !== null);
};

export const analyzeSalesPattern = (product) => {
    const sales = product.inventoryHistory || [];
    if (sales.length < 7) {
        return { 
            isUnusual: false, 
            pattern: 'insufficient_data' 
        };
    }

    const recentSales = sales.slice(-7);
    const avgSales = recentSales.reduce((a, b) => a + b.quantity, 0) / 7;
    const prevAvgSales = sales.slice(-14, -7).reduce((a, b) => a + b.quantity, 0) / 7;

    if (avgSales === 0 && prevAvgSales > 0) {
        return { isUnusual: true, pattern: 'no_recent_sales' };
    } else if (avgSales > prevAvgSales * 2) {
        return { isUnusual: true, pattern: 'sudden_increase' };
    } else if (avgSales < prevAvgSales * 0.5) {
        return { isUnusual: true, pattern: 'sudden_decrease' };
    }

    return { isUnusual: false, pattern: 'normal' };
};

export const generateAlerts = (products) => {
    if (!Array.isArray(products)) return [];

    const alerts = [];
    products.forEach(product => {
        const daysUntilExpiry = moment(product.bestBefore).diff(moment(), 'days');
        
        // Expiry alerts
        if (daysUntilExpiry <= 7) {
            let expiryMessage;
            if (daysUntilExpiry < 0) {
                expiryMessage = `${product.name} has expired for ${Math.abs(daysUntilExpiry)} days`;
            } else if (daysUntilExpiry === 0) {
                expiryMessage = `${product.name} expires today`;
            } else if (daysUntilExpiry === 1) {
                expiryMessage = `${product.name} will expire in 1 day`;
            } else {
                expiryMessage = `${product.name} will expire in ${daysUntilExpiry} days`;
            }

            alerts.push({
                type: 'expiry',
                priority: 1,
                title: daysUntilExpiry <= 0 ? 'Product Expired' : 'Product Expiring Soon',
                message: expiryMessage + ` - Best Before: ${moment(product.bestBefore).format('MMM D, YYYY')}`,
                productId: product._id,
                timestamp: new Date(),
                daysUntilExpiry
            });
        }

        // Stock alerts
        if (product.stock <= 10) {
            alerts.push({
                type: 'stock',
                priority: 2,
                title: product.stock === 0 ? 'Out of Stock' : 'Low Stock Alert',
                message: `${product.name} - ${product.stock} ${product.unit || 'items'} remaining${
                    product.stock === 0 ? '' : 
                    product.stock === 1 ? ' (Critical Level)' : 
                    ' (Low Level)'
                }`,
                productId: product._id,
                timestamp: new Date(),
                stock: product.stock
            });
        }

        // Sales pattern analysis
        const pattern = analyzeSalesPattern(product);
        if (pattern.isUnusual) {
            alerts.push({
                type: 'sales',
                priority: 3,
                title: 'Unusual Sales Pattern',
                message: `${product.name} - ${
                    pattern.pattern === 'no_recent_sales' ? 'No sales in the past week' :
                    pattern.pattern === 'sudden_increase' ? 'Significant increase in sales' :
                    pattern.pattern === 'sudden_decrease' ? 'Significant decrease in sales' :
                    'Unusual sales pattern detected'
                }`,
                productId: product._id,
                timestamp: new Date()
            });
        }
    });

    // Sort by timestamp (most recent first) and then by priority
    return alerts.sort((a, b) => {
        if (b.timestamp - a.timestamp === 0) {
            return a.priority - b.priority;
        }
        return b.timestamp - a.timestamp;
    });

};

export const calculateQualityScore = (product) => {
    if (!product) return 0;

    const weights = {
        rating: 0.3,
        freshness: 0.3,
        sales: 0.2,
        stock: 0.2
    };

    const ratingScore = (product.rating / 5) * 100;
    
    const daysUntilExpiry = moment(product.bestBefore).diff(moment(), 'days');
    const totalShelfLife = moment(product.bestBefore).diff(moment(product.harvestDate), 'days');
    const freshnessScore = Math.max(0, Math.min(100, (daysUntilExpiry / totalShelfLife) * 100));
    
    const salesScore = Math.min(100, (product.salesCount / product.stock) * 100);
    
    const stockScore = Math.min(100, (product.stock / 100) * 100);

    return Math.round(
        (weights.rating * ratingScore) +
        (weights.freshness * freshnessScore) +
        (weights.sales * salesScore) +
        (weights.stock * stockScore)
    );
};