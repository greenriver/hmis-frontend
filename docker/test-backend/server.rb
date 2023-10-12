require 'rack'

app = proc do |env|
  headers =
    env
    .select { |k, _v| k.start_with? 'HTTP_' }
    .collect { |key, val| [key.sub(/^HTTP_/, ''), val] }
    .collect { |key, val| "#{key}: #{val}\n" }
    .sort
  [200, { 'Content-Type' => 'text/plain' }, headers]
end

Rack::Server.start app: app, Port: 8080
