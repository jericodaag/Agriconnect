import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_product } from '../../store/Reducers/productReducer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const InventoryHistory = ({ productId }) => {
    const dispatch = useDispatch();
    const { product } = useSelector(state => state.product);
    const [timelineData, setTimelineData] = useState([]);

    useEffect(() => {
        dispatch(get_product(productId));
    }, [dispatch, productId]);

    useEffect(() => {
        if (product) {
            const uploadDate = moment(product.createdAt);
            const expiryDate = moment(product.bestBefore);
            const currentDate = moment();

            setTimelineData([
                { date: uploadDate.format('YYYY-MM-DD'), event: 'Upload Date', value: 100 },
                { date: currentDate.format('YYYY-MM-DD'), event: 'Current Date', value: 50 },
                { date: expiryDate.format('YYYY-MM-DD'), event: 'Expiry Date', value: 0 }
            ]);
        }
    }, [product]);

    if (!product) {
        return <div>Loading...</div>;
    }

    const uploadDate = moment(product.createdAt);
    const expiryDate = moment(product.bestBefore);
    const currentDate = moment();

    const daysUntilExpiry = expiryDate.diff(currentDate, 'days');
    const totalLifespan = expiryDate.diff(uploadDate, 'days');
    const remainingLifespan = Math.max(daysUntilExpiry, 0);
    const lifespanPercentage = (remainingLifespan / totalLifespan) * 100;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-[#438206] font-bold text-2xl mb-4">Product Lifecycle</h2>
            <div className="mb-4">
                <p><strong>Product Name:</strong> {product.name}</p>
                <p><strong>Upload Date:</strong> {uploadDate.format('MMMM D, YYYY')}</p>
                <p><strong>Expiry Date:</strong> {expiryDate.format('MMMM D, YYYY')}</p>
                <p><strong>Days Until Expiry:</strong> {daysUntilExpiry}</p>
                <p><strong>Remaining Lifespan:</strong> {lifespanPercentage.toFixed(2)}%</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-white border p-2">
                                    <p>{`${payload[0].payload.event}: ${payload[0].payload.date}`}</p>
                                </div>
                            );
                        }
                        return null;
                    }} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="Product Lifecycle" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InventoryHistory;