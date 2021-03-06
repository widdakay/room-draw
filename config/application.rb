require_relative 'boot'

require 'rails/all'
require 'csv'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Load env vars from .env
Dotenv::Railtie.load

module RoomDraw
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # set up delayed_job adapter
    config.active_job.queue_adapter = :delayed_job
    
    # Set time zone to PT
    config.time_zone = 'Pacific Time (US & Canada)'
    config.active_record.default_timezone = :local
    
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end
