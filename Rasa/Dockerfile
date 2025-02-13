FROM rasa/rasa:3.6.0  

# Set working directory
WORKDIR /app

# Copy the Rasa project files into the container
COPY . /app

# Install any dependencies listed in the requirements.txt file
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Render will use (default is 10000)
EXPOSE $PORT

# Start the Rasa server, making it listen on the dynamic $PORT
CMD ["rasa", "run", "--port", "$PORT", "--cors", "*"]
