FROM rasa/rasa:3.6.0  

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install dependencies 
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Render will use
EXPOSE 5005

# Start Rasa server
CMD ["run", "--enable-api", "--cors", "*"]
