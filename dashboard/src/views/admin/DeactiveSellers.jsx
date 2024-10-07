import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { get_deactive_sellers } from '../../store/Reducers/sellerReducer';

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
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

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

const DeactiveSellers = () => {
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(5);
    const { sellers, totalSeller } = useSelector(state => state.seller);

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        };
        dispatch(get_deactive_sellers(obj));
    }, [searchValue, currentPage, parPage, dispatch]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Deactive Sellers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <Select value={parPage.toString()} onValueChange={(value) => setParPage(parseInt(value))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sellers per page" />
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
                        placeholder="Search sellers..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Shop Name</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sellers.map((d, i) => (
                            <TableRow key={i}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={d.image} alt={d.name} />
                                        <AvatarFallback>{d.name[0]}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{d.name}</TableCell>
                                <TableCell>{d.shopInfo?.shopName}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{d.payment}</Badge>
                                </TableCell>
                                <TableCell>{d.email}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{d.status}</Badge>
                                </TableCell>
                                <TableCell>{d.shopInfo?.district}</TableCell>
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

export default DeactiveSellers;