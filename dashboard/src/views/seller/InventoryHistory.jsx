import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_inventory_history } from '../../store/Reducers/productReducer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const InventoryHistory = ({ productId }) => {
    const dispatch = useDispatch();
    const { inventoryHistory } = useSelector(state => state.product);

    useEffect(() => {
        dispatch(get_inventory_history(productId));
    }, [dispatch, productId]);

    const formattedData = inventoryHistory.map(item => ({
        ...item,
        date: moment(item.date).format('YYYY-MM-DD')
    }));

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-[#438206] font-bold text-2xl mb-4">Inventory History</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="quantity" stroke="#8884d8" name="Stock Quantity" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InventoryHistory;