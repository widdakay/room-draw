class EmailsController < ApplicationController
  before_action :set_email, only: [:show, :edit, :update, :destroy]
  after_action :verify_authorized
  include EmailsHelper

  def new
    authorize Email
    @email = Email.new
  end

  def edit
    authorize @email
  end

  def index
    authorize Email
    @emails = Email.all.reverse
  end

  def show
    authorize @email
  end

  def create
    authorize Email
    respond_to do |format|
      if makeEmail(params)
        format.html { redirect_to emails_path, notice: 'Email was successfully created.' }
        format.json { render :index, status: :ok}
      else
        format.html { render :new }
        format.json { render json: @email.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    authorize @email
    no_errors = true
    email = params["email"]
    params["email"]["sendDate"] = Date.new(email["sendDate(1i)"].to_i,
                                          email["sendDate(2i)"].to_i,
                                          email["sendDate(3i)"].to_i)
    if params["email"]["sendDate"] != @email["sendDate"]
      @email.destroy
      no_errors = makeEmail(params)
    else
      # Don't make a new delayed job if we don't need to.
      no_errors = @email.update(email_params)
    end
    # Redirect to the right page
    respond_to do |format|
      if no_errors
        format.html { redirect_to emails_path, notice: 'Email was successfully updated.' }
        format.json { render :show, status: :ok}
      else
        format.html { render :edit }
        format.json { render json: @email.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    authorize @email
    @email.destroy
    respond_to do |format|
      format.html { redirect_to emails_path, notice: 'Email was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    def set_email
      @email = Email.find(params[:id])
    end

    def email_params
      params.require(:email).permit(
        :subject,
        :description,
        :sendDate,
        :send_to_never_logged_in,
        :send_to_never_pulled_room,
        :send_to_formerly_in_room,
        :send_to_in_room,
        :send_to_admins)
    end

    def makeEmail(params)
      email = params["email"]

      # extract send datetime
      sendDate = Date.new(email["sendDate(1i)"].to_i,
                          email["sendDate(2i)"].to_i,
                          email["sendDate(3i)"].to_i)
      # extract subject of the email
      subject = email["subject"]

      # extract content of the email
      content = email["description"]
      @email = Email.new(
        subject: subject,
        description: content,
        sendDate: sendDate,
        sent_status: false,
        send_to_never_logged_in: email["send_to_never_logged_in"],
        send_to_never_pulled_room: email["send_to_never_pulled_room"],
        send_to_formerly_in_room: email["send_to_formerly_in_room"],
        send_to_in_room: email["send_to_in_room"],
        send_to_admins: email["send_to_admins"])

      if @email.save
        GeneralMailer.schedule_reminder_email(@email["sendDate"], @email.attributes['id'])
        return @email
      else
        return nil
      end
    end

end
