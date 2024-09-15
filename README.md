This is a nextJS project created for Nebula9.ai. It involves transcripting call recordings and evaluating the quality of contact center agent calls by
analyzing tone, sentiment and adherence to the best practices.
It also provides a Quality Assessment Report with suggestions for improvement.

To run this project on your system follow the steps given below: 
1) Download the zip and open it on your IDE (in my case it is VS CODE)
2) go to terminal
3) install dependencies:
   ```bash
    npm install openai #installs openai to run the api's
   rm -rf node_modules # Remove the existing node_modules folder
   rm package-lock.json  # Remove package-lock.json (optional but recommended)

   npm install  # Reinstall dependencies

4) Now check if everything is installed and there are no more dependencies using:
   npm i
5) finally go to the .env.local file and add your own OPENAI API KEY

6) run the development server:
   npm run dev

Voila! The project is hosted on your local server, view it on (http://localhost:3000) on your google chrome browser, to view the results.
Select a sample .mp3 file of a call recording (Or use the one that I have provided in this repository)
and click on Analyze




   



