import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_active_sellers } from '../../store/Reducers/sellerReducer';
import { Link } from 'react-router-dom';
import { Eye, ArrowUpDown, ChevronDown, SlidersHorizontal } from "lucide-react";
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

// Mobile Card Component
const SellerCard = ({ seller, visibleColumns }) => (
  <div className="p-4 border rounded-lg mb-4 space-y-4">
    <div className="flex items-center space-x-4">
      {visibleColumns.image && (
        <Avatar>
          <AvatarImage src={seller.image} alt={seller.name} />
          <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1">
        {visibleColumns.name && <div className="font-medium">{seller.name}</div>}
        {visibleColumns.email && <div className="text-sm text-gray-500">{seller.email}</div>}
      </div>
      <Link to={`/admin/dashboard/seller/details/${seller._id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    </div>
    
    <div className="grid grid-cols-2 gap-4 text-sm">
      {visibleColumns.shopName && (
        <div>
          <span className="text-gray-500">Shop Name</span>
          <div className="font-medium">{seller.shopInfo?.shopName}</div>
        </div>
      )}
      {visibleColumns.district && (
        <div>
          <span className="text-gray-500">District</span>
          <div className="font-medium">{seller.shopInfo?.district}</div>
        </div>
      )}
      {visibleColumns.payment && (
        <div>
          <span className="text-gray-500">Payment</span>
          <div>
            <Badge variant={seller.payment === 'verified' ? 'success' : 'warning'}>
              {seller.payment}
            </Badge>
          </div>
        </div>
      )}
      {visibleColumns.status && (
        <div>
          <span className="text-gray-500">Status</span>
          <div>
            <Badge variant={seller.status === 'active' ? 'success' : 'secondary'}>
              {seller.status}
            </Badge>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, setCurrentPage, totalItems, parPage }) => {
  const totalPages = Math.ceil(totalItems / parPage);
  
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

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
    
    const aValue = sortColumn.includes('.') ? 
      sortColumn.split('.').reduce((obj, key) => obj?.[key], a) : 
      a[sortColumn];
    const bValue = sortColumn.includes('.') ? 
      sortColumn.split('.').reduce((obj, key) => obj?.[key], b) : 
      b[sortColumn];

    if (!aValue) return sortDirection === 'asc' ? -1 : 1;
    if (!bValue) return sortDirection === 'asc' ? 1 : -1;
    
    return sortDirection === 'asc' ? 
      aValue.localeCompare(bValue) : 
      bValue.localeCompare(aValue);
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sellers</CardTitle>
        <CardDescription>Manage and view all active sellers on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile Filters */}
        <div className="md:hidden space-y-4 mb-4">
          <Input
            placeholder="Search sellers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
          />
          <div className="flex gap-2">
            <Select 
              value={parPage.toString()} 
              onValueChange={(value) => setParPage(parseInt(value))}
              className="flex-1"
            >
              <SelectTrigger>
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="h-4 w-4" />
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
                    {column.replace(/([A-Z])/g, ' $1').trim()}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search sellers..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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
                    {column.replace(/([A-Z])/g, ' $1').trim()}
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

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border">
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

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {sortedSellers.map((seller) => (
            <SellerCard 
              key={seller._id} 
              seller={seller} 
              visibleColumns={visibleColumns}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={totalSeller}
          parPage={parPage}
        />
      </CardContent>
    </Card>
  );
};

export default Sellers;