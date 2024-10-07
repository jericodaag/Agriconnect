import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { get_seller_request } from '../../store/Reducers/sellerReducer';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const Pagination = ({ pageNumber, setPageNumber, totalItem, parPage, showItem }) => {
  const totalPages = Math.ceil(totalItem / parPage);
  const startPage = Math.max(1, pageNumber - Math.floor(showItem / 2));
  const endPage = Math.min(totalPages, startPage + showItem - 1);

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
        disabled={pageNumber === 1}
      >
        Previous
      </Button>
      {[...Array(endPage - startPage + 1)].map((_, idx) => (
        <Button
          key={startPage + idx}
          variant={pageNumber === startPage + idx ? "secondary" : "outline"}
          size="sm"
          onClick={() => setPageNumber(startPage + idx)}
        >
          {startPage + idx}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPageNumber(prev => Math.min(prev + 1, totalPages))}
        disabled={pageNumber === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

const SellerRequest = () => {
    const dispatch = useDispatch();
    const { sellers, totalSeller } = useSelector(state => state.seller);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(5);

    useEffect(() => {
        dispatch(get_seller_request({
            parPage,
            searchValue,
            page: currentPage
        }));
    }, [parPage, searchValue, currentPage, dispatch]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Seller Requests</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <Select value={parPage.toString()} onValueChange={(value) => setParPage(parseInt(value))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Requests per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 per page</SelectItem>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        className="max-w-sm"
                        type="text"
                        placeholder="Search requests..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sellers.map((d, i) => (
                            <TableRow key={i}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell className="font-medium">{d.name}</TableCell>
                                <TableCell>{d.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{d.payment}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={d.status === 'active' ? 'success' : 'secondary'}>{d.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link to={`/admin/dashboard/seller/details/${d._id}`}>
                                            <FaEye className="mr-2" /> View
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex justify-end mt-4">
                    <Pagination
                        pageNumber={currentPage}
                        setPageNumber={setCurrentPage}
                        totalItem={totalSeller}
                        parPage={parPage}
                        showItem={3}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default SellerRequest;