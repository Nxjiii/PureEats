# Use the official Rasa image
FROM rasa/rasa:3.6.0  

# Set working directory inside the container
WORKDIR /app

# Copy all Rasa project files into the container
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Render dynamic port
EXPOSE $PORT

# Run Rasa on the assigned port with API enabled
CMD ["rasa", "run", "--enable-api", "--cors", "*", "--port", "10000"]
