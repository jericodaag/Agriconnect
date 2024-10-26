const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { dbConnect } = require('./utilities/db')
const { initializeEmailService } = require('./utilities/emailService')
const dotenv = require('dotenv')

const socket = require('socket.io')
const http = require('http')
const server = http.createServer(app)

// Load environment variables first
dotenv.config()

// Initialize all services
const initializeServices = async () => {
    try {
        // Initialize email service
        console.log('Initializing email service...')
        const emailServiceInitialized = await initializeEmailService()
        if (!emailServiceInitialized) {
            console.error('Failed to initialize email service. Check your email configuration.')
        } else {
            console.log('Email service initialized successfully')
        }

        // Initialize database
        await dbConnect()
        console.log('Database connected successfully')

    } catch (error) {
        console.error('Service initialization failed:', error)
        throw error
    }
}

// Cors setup
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}))

// Socket.io setup
const io = socket(server, {
    cors: {
        origin: '*',
        credentials: true
    }
})

// Socket user management
var allCustomer = []
var allSeller = []
let admin = {}

const addUser = (customerId, socketId, userInfo) => {
    const checkUser = allCustomer.some(u => u.customerId === customerId)
    if (!checkUser) {
        allCustomer.push({
            customerId,
            socketId,
            userInfo
        })
    }
}

const addSeller = (sellerId, socketId, userInfo) => {
    const checkSeller = allSeller.some(u => u.sellerId === sellerId)
    if (!checkSeller) {
        allSeller.push({
            sellerId,
            socketId,
            userInfo
        })
    }
}

const findCustomer = (customerId) => {
    return allCustomer.find(c => c.customerId === customerId)
}

const findSeller = (sellerId) => {
    return allSeller.find(c => c.sellerId === sellerId)
}

const remove = (socketId) => {
    allCustomer = allCustomer.filter(c => c.socketId !== socketId)
    allSeller = allSeller.filter(c => c.socketId !== socketId)
}

// Socket event handlers
io.on('connection', (soc) => {
    console.log('Socket server connected, ID:', soc.id)

    soc.on('add_user', (customerId, userInfo) => {
        console.log('Adding user:', customerId)
        if (customerId && userInfo) {
            addUser(customerId, soc.id, userInfo)
            io.emit('activeSeller', allSeller)
            console.log('User added successfully')
        } else {
            console.error('Invalid user data received:', { customerId, userInfo })
        }
    })

    soc.on('add_seller', (sellerId, userInfo) => {
        console.log('Adding seller:', sellerId)
        if (sellerId && userInfo) {
            addSeller(sellerId, soc.id, userInfo)
            io.emit('activeSeller', allSeller)
            console.log('Seller added successfully')
        } else {
            console.error('Invalid seller data received:', { sellerId, userInfo })
        }
    })

    soc.on('send_seller_message', (msg) => {
        console.log('Sending seller message to:', msg.receverId)
        const customer = findCustomer(msg.receverId)
        if (customer) {
            soc.to(customer.socketId).emit('seller_message', msg)
            console.log('Message sent to customer')
        } else {
            console.error('Customer not found:', msg.receverId)
        }
    })

    soc.on('send_customer_message', (msg) => {
        console.log('Sending customer message to:', msg.receverId)
        const seller = findSeller(msg.receverId)
        if (seller) {
            soc.to(seller.socketId).emit('customer_message', msg)
            console.log('Message sent to seller')
        } else {
            console.error('Seller not found:', msg.receverId)
        }
    })

    soc.on('send_message_admin_to_seller', (msg) => {
        console.log('Sending admin message to seller:', msg.receverId)
        const seller = findSeller(msg.receverId)
        if (seller) {
            soc.to(seller.socketId).emit('receved_admin_message', msg)
            console.log('Message sent to seller')
        } else {
            console.error('Seller not found:', msg.receverId)
        }
    })

    soc.on('send_message_seller_to_admin', (msg) => {
        console.log('Sending seller message to admin')
        if (admin.socketId) {
            soc.to(admin.socketId).emit('receved_seller_message', msg)
            console.log('Message sent to admin')
        } else {
            console.error('Admin not connected')
        }
    })

    soc.on('add_admin', (adminInfo) => {
        console.log('Adding admin')
        if (adminInfo && typeof adminInfo === 'object') {
            let safeAdminInfo = { ...adminInfo }
            if ('email' in safeAdminInfo) delete safeAdminInfo.email
            if ('password' in safeAdminInfo) delete safeAdminInfo.password
            admin = safeAdminInfo
            admin.socketId = soc.id
            io.emit('activeSeller', allSeller)
            console.log('Admin added successfully')
        } else {
            console.error('Invalid admin info received:', adminInfo)
        }
    })

    soc.on('disconnect', () => {
        console.log('User disconnected:', soc.id)
        remove(soc.id)
        io.emit('activeSeller', allSeller)
    })
})

// Middleware
app.use(bodyParser.json())
app.use(cookieParser())

// Routes
app.use('/api/home', require('./routes/home/homeRoutes'))
app.use('/api', require('./routes/authRoutes'))
app.use('/api', require('./routes/order/orderRoutes'))
app.use('/api', require('./routes/home/cardRoutes'))
app.use('/api', require('./routes/dashboard/categoryRoutes'))
app.use('/api', require('./routes/dashboard/productRoutes'))
app.use('/api', require('./routes/dashboard/sellerRoutes'))
app.use('/api', require('./routes/home/customerAuthRoutes'))
app.use('/api', require('./routes/chatRoutes'))
app.use('/api', require('./routes/paymentRoutes'))
app.use('/api', require('./routes/dashboard/dashboardRoutes'))

// Test route for email service
app.get('/api/test-email', async (req, res) => {
    try {
        const { sendResetPasswordEmail } = require('./utilities/emailService')
        await sendResetPasswordEmail(
            process.env.EMAIL_USER,
            'Test User',
            'test-token-123'
        )
        res.json({ message: 'Test email sent successfully' })
    } catch (error) {
        console.error('Test email failed:', error)
        res.status(500).json({ error: error.message })
    }
})

app.get('/', (req, res) => res.send('Hello Server'))

// Start server with all services
const startServer = async () => {
    try {
        await initializeServices()
        const port = process.env.PORT
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`)
            console.log(`Email service configured for: ${process.env.EMAIL_USER}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

// Initialize everything
startServer()