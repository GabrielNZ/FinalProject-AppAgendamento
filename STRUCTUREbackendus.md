# Project Structure

### Authentication:
- Login occurs via /auth/login
- The backend:
  - Validates email and password
  - Generates a JWT
  - Returns the token in the Authorization header
  - The frontend saves this token (ex: localStorage)
  - All subsequent requests send this token in the header
  
### Users:
- Provider:
  - Cria serviços
  - Defines available time slots
  - Views and manages their appointments
- Client:
  - Views services
  - Schedules time slots
  - Manages their own appointments

### Scheduling:
- Cliente:
  - Chooses a service
  - Chooses an available date and time
  - Sends the scheduling request
    - -> Provider's email
    - -> Provider's dashboard
- System:
  - Validates the user's token
  - Creates the appointment as PENDING
  - Does not definitively block the time slot yet ( Other clients can request this time slot )
- Provider:
  - Approves or Rejects the appointment
    - Approved: Time slot blocked. ( No appointment can be made at this time, unless the Provider cancels it, freeing the time slot again. )
    - Rejected: System registers it as rejected and the appointment is discarded
- Obs: Within 24h after the appointment date, the provider can mark that the client did not show up, after 24h the option is disabled ( System considers the client's presence )

### Gateway:
- It is the only access point for the frontend
- Receives all HTTP requests
- Performs:
  - CORS
  - JWT validation
  - Blocks requests without token
  - If the token is valid:
  - Extracts user data (email, type)
  - Forwards the request to the correct microservice
