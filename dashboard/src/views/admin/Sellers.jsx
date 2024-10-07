import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_active_sellers } from '../../store/Reducers/sellerReducer';
import { Link } from 'react-router-dom';
import { Eye, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";

const Sellers = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [parPage, setParPage] = useState(10);
  const { sellers, totalSeller } = useSelector(state => state.seller);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    name: true,
    shopName: true,
    payment: true,
    email: true,
    status: true,
    district: true,
  });

  useEffect(() => {
    const obj = {
      parPage: parseInt(parPage),
      page: parseInt(currentPage),
      searchValue
    };
    dispatch(get_active_sellers(obj));
  }, [searchValue, currentPage, parPage, dispatch]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedSellers = [...sellers].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = sortColumn.includes('.') ? sortColumn.split('.').reduce((obj, key) => obj[key], a) : a[sortColumn];
    const bValue = sortColumn.includes('.') ? sortColumn.split('.').reduce((obj, key) => obj[key], b) : b[sortColumn];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sellers</CardTitle>
        <CardDescription>Manage and view all active sellers on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search sellers..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.keys(visibleColumns).map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    className="capitalize"
                    checked={visibleColumns[column]}
                    onCheckedChange={(value) =>
                      setVisibleColumns((prev) => ({ ...prev, [column]: value }))
                    }
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Select value={parPage.toString()} onValueChange={(value) => setParPage(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.image && <TableHead className="w-[100px] text-center">Image</TableHead>}
                {visibleColumns.name && (
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => handleSort('name')} className="w-full justify-center">
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.shopName && (
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => handleSort('shopInfo.shopName')} className="w-full justify-center">
                      Shop Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.payment && <TableHead className="text-center">Payment Status</TableHead>}
                {visibleColumns.email && <TableHead className="text-center">Email</TableHead>}
                {visibleColumns.status && <TableHead className="text-center">Status</TableHead>}
                {visibleColumns.district && <TableHead className="text-center">District</TableHead>}
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSellers.map((seller) => (
                <TableRow key={seller._id}>
                  {visibleColumns.image && (
                    <TableCell className="text-center">
                      <Avatar className="mx-auto">
                        <AvatarImage src={seller.image} alt={seller.name} />
                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                  )}
                  {visibleColumns.name && <TableCell className="text-center">{seller.name}</TableCell>}
                  {visibleColumns.shopName && <TableCell className="text-center">{seller.shopInfo?.shopName}</TableCell>}
                  {visibleColumns.payment && (
                    <TableCell className="text-center">
                      <Badge variant={seller.payment === 'verified' ? 'success' : 'warning'}>
                        {seller.payment}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.email && <TableCell className="text-center">{seller.email}</TableCell>}
                  {visibleColumns.status && (
                    <TableCell className="text-center">
                      <Badge variant={seller.status === 'active' ? 'success' : 'secondary'}>
                        {seller.status}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.district && <TableCell className="text-center">{seller.shopInfo?.district}</TableCell>}
                  <TableCell className="text-center">
                    <Link to={`/admin/dashboard/seller/details/${seller._id}`}>
                      <Button variant="ghost" className="h-8 w-8 p-0 mx-auto">
                        <span className="sr-only">View Details</span>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Add pagination component here */}
      </CardContent>
    </Card>
  );
};

export default Sellers;